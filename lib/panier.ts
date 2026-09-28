import { prisma } from "@/lib/prisma"
import { cibleSlot } from "@/lib/formule"

// Validation et chiffrage du panier CÔTÉ SERVEUR.
//
// Le navigateur envoie ce que le client a choisi. On ne fait confiance à
// aucune des valeurs reçues : elles indiquent seulement les choix. Les prix,
// les disponibilités et les règles (nombre de personnes, articles autorisés)
// sont relus en base. Sans ça, n'importe qui pourrait modifier la requête
// dans les outils de développement et payer le prix de son choix.

export type LignePanier = {
  formuleId: number
  formuleNom: string
  // Relue en base : /api/checkout s'en sert pour attribuer à chaque commande
  // le créneau de sa catégorie. Jamais celle envoyée par le navigateur.
  categorieId: number
  categorieNom: string
  creneauxCategorie: string[]
  nbPersonnes: number
  // Recopiee depuis la base : sert au libelle envoye a Stripe.
  unite: string
  montantCentimes: number
  selections: { slotId: number; articleId: number; quantite: number }[]
  extras: { extraId: number; quantite: number }[]
}

type Resultat =
  | { ok: true; lignes: LignePanier[] }
  | { ok: false; status: 400 | 409; error: string }

// Les prix sont stockés en Float. Or en JavaScript, 9.9 × 10 vaut
// 99.00000000000001 : les nombres à virgule flottante ne représentent pas
// exactement la plupart des décimales. On calcule donc en centimes entiers,
// et on ne repasse en euros qu'à l'enregistrement ou à l'affichage.
export function enCentimes(euros: number) {
  return Math.round(euros * 100)
}

function entierPositif(valeur: unknown): valeur is number {
  return Number.isInteger(valeur) && (valeur as number) > 0
}

// 400 : requête mal formée (ne peut pas venir du site tel qu'il est codé).
function invalide(): Resultat {
  return { ok: false, status: 400, error: "Panier invalide." }
}

// 409 : panier cohérent au moment de sa création, mais qui ne correspond
// plus à l'offre actuelle (prix, disponibilité ou règles modifiés).
function aActualiser(error: string): Resultat {
  return { ok: false, status: 409, error }
}

export async function validerPanier(itemsRecus: unknown): Promise<Resultat> {
  if (!Array.isArray(itemsRecus) || itemsRecus.length === 0) {
    return { ok: false, status: 400, error: "Panier vide" }
  }

  const items = itemsRecus as Record<string, unknown>[]
  const formeCorrecte = items.every(
    (i) =>
      typeof i === "object" && i !== null &&
      entierPositif(i.formuleId) && entierPositif(i.nbPersonnes) &&
      Array.isArray(i.lignes) && Array.isArray(i.extras)
  )
  if (!formeCorrecte) return invalide()

  // Deux requêtes pour tout le panier, quel que soit le nombre de formules,
  // plutôt qu'une requête par formule (le problème dit « N+1 »).
  const formuleIds = Array.from(new Set(items.map((i) => i.formuleId as number)))
  const [formules, extrasDisponibles] = await Promise.all([
    prisma.formule.findMany({
      where: { id: { in: formuleIds } },
      include: {
        // La catégorie est de nouveau jointe : ses créneaux de livraison
        // sont nécessaires pour valider celui que le client a choisi.
        categorie: { select: { id: true, nom: true, creneaux: true } },
        slots: {
          include: {
            articles: { where: { article: { disponible: true } }, select: { articleId: true } },
          },
        },
      },
    }),
    prisma.extra.findMany({ where: { disponible: true }, select: { id: true, prix: true, categorieId: true } }),
  ])

  // Map : accès direct par id, sans reparcourir le tableau à chaque ligne.
  const formuleParId = new Map(formules.map((f) => [f.id, f]))
  const extraParId = new Map(extrasDisponibles.map((e) => [e.id, e]))

  const lignes: LignePanier[] = []

  for (const item of items) {
    const formule = formuleParId.get(item.formuleId as number)
    if (!formule) {
      return aActualiser("Une formule de votre panier n'est plus proposée. Retirez-la de votre panier.")
    }

    const nom = formule.nom.trim()
    const nbPersonnes = item.nbPersonnes as number

    // Même règle que les boutons +/− de la page de commande :
    // au moins minPersonnes, puis par tranches de pasPersonnes.
    const nbValide =
      nbPersonnes >= formule.minPersonnes &&
      (nbPersonnes - formule.minPersonnes) % formule.pasPersonnes === 0
    if (!nbValide) {
      return aActualiser(
        `Le nombre de personnes pour la formule ${nom} ne correspond plus aux conditions ` +
        `(à partir de ${formule.minPersonnes}, par tranche de ${formule.pasPersonnes}). Retirez-la et ajoutez-la à nouveau.`
      )
    }

    // Le client répartit des quantités par créneau. On revérifie ici que
    // chaque créneau tombe EXACTEMENT sur son quota : ni moins (le traiteur
    // livrerait un panier incomplet), ni plus (le client recevrait des
    // articles non facturés, puisque le prix ne dépend que du nombre de
    // personnes). L'interface applique déjà cette règle, mais rien n'oblige
    // à passer par l'interface pour appeler cette API.
    const lignesRecues = item.lignes as unknown[]

    // Cumul par créneau, et détection des doublons : deux lignes pour le
    // même couple (créneau, article) passeraient le contrôle de quota tout
    // en créant deux OrderItem concurrents pour la même chose.
    const quantiteParSlot = new Map<number, number>()
    const couplesVus = new Set<string>()
    const selections: { slotId: number; articleId: number; quantite: number }[] = []

    for (const ligneRecue of lignesRecues) {
      if (typeof ligneRecue !== "object" || ligneRecue === null) return invalide()
      const { slotId, articleId, quantite } = ligneRecue as Record<string, unknown>
      if (!entierPositif(slotId) || !entierPositif(articleId) || !entierPositif(quantite)) {
        return invalide()
      }

      // Le créneau doit appartenir à CETTE formule, et l'article à CE créneau.
      // formule.slots.articles est déjà filtré sur les articles disponibles :
      // un article retiré du stock fait donc échouer la vérification.
      const slot = formule.slots.find((s) => s.id === slotId)
      if (!slot || !slot.articles.some((a) => a.articleId === articleId)) {
        return aActualiser(
          `Un article choisi pour la formule ${nom} n'est plus disponible. Retirez la formule et composez-la à nouveau.`
        )
      }

      const couple = `${slotId}:${articleId}`
      if (couplesVus.has(couple)) return invalide()
      couplesVus.add(couple)

      quantiteParSlot.set(slotId, (quantiteParSlot.get(slotId) ?? 0) + quantite)
      selections.push({ slotId, articleId, quantite })
    }

    // Chaque créneau de la formule doit être servi, y compris ceux que le
    // client n'a pas vus parce qu'ils ne proposaient qu'un seul article.
    for (const slot of formule.slots) {
      // slot.articles est filtré sur les articles disponibles : un créneau
      // vide est un créneau que plus rien ne peut satisfaire. On le dit
      // explicitement, au lieu de laisser passer une commande amputée.
      if (slot.articles.length === 0) {
        return aActualiser(
          `Plus aucun article n'est disponible pour « ${slot.nom} » dans la formule ${nom}. ` +
          `Retirez-la de votre panier.`
        )
      }
      // Même fonction que la page de commande : la règle de quota n'est
      // écrite qu'une fois, les deux côtés ne peuvent pas diverger.
      const cible = cibleSlot(nbPersonnes, slot.capacite, slot.quantiteParUnite)
      if ((quantiteParSlot.get(slot.id) ?? 0) !== cible) {
        return aActualiser(
          `La répartition de « ${slot.nom} » pour la formule ${nom} ne correspond plus ` +
          `(${cible} attendu${cible > 1 ? "s" : ""}). Retirez la formule et composez-la à nouveau.`
        )
      }
    }

    let montantCentimes = enCentimes(formule.prix) * nbPersonnes

    const extras: { extraId: number; quantite: number }[] = []
    for (const extraRecu of item.extras as unknown[]) {
      const extraId = (extraRecu as { extraId?: unknown } | null)?.extraId
      const quantite = (extraRecu as { quantite?: unknown } | null)?.quantite
      if (!entierPositif(extraId) || !entierPositif(quantite)) return invalide()

      const extra = extraParId.get(extraId)
      if (!extra) {
        return aActualiser("Un extra de votre panier n'est plus disponible. Retirez la formule et ajoutez-la à nouveau.")
      }
      // Un extra est proposé soit pour toutes les formules (categorieId à
      // null), soit pour la catégorie de CETTE formule. On revérifie ici ce
      // que /api/extras applique déjà à l'affichage : rien n'oblige à passer
      // par la page de commande pour appeler cette API.
      if (extra.categorieId !== null && extra.categorieId !== formule.categorieId) {
        return aActualiser(
          `Un extra de votre panier n'est plus proposé avec la formule ${nom}. Retirez-la et ajoutez-la à nouveau.`
        )
      }
      // Les extras ne sont pas multipliés par le nombre de personnes,
      // comme sur la page de commande.
      montantCentimes += enCentimes(extra.prix) * quantite
      extras.push({ extraId, quantite })
    }

    // Le montant affiché dans le panier doit être celui qui sera payé. S'il
    // diffère (prix modifié par l'admin, ou requête falsifiée), on refuse
    // plutôt que de facturer silencieusement un autre montant. Un centime de
    // tolérance absorbe les arrondis du calcul fait par le navigateur.
    const affiche = typeof item.subtotal === "number" ? enCentimes(item.subtotal) : NaN
    if (!(Math.abs(affiche - montantCentimes) <= 1)) {
      return aActualiser(
        `Le prix de la formule ${nom} a changé depuis son ajout au panier ` +
        `(${(montantCentimes / 100).toFixed(2)} €). Retirez-la et ajoutez-la à nouveau.`
      )
    }

    lignes.push({
      formuleId: formule.id,
      formuleNom: nom,
      categorieId: formule.categorie.id,
      categorieNom: formule.categorie.nom,
      creneauxCategorie: formule.categorie.creneaux,
      nbPersonnes,
      unite: formule.unite,
      montantCentimes,
      selections,
      extras,
    })
  }

  return { ok: true, lignes }
}
