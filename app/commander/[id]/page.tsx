"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useCart, type LigneSelection } from "@/context/CartContext"
import { libelleUnite, uniteCourte, cibleSlot } from "@/lib/formule"
import { useLang } from "@/context/LangContext"
import { traduireContenu } from "@/lib/i18n/contenu"
import type { Langue } from "@/lib/i18n/config"
import type { Dictionnaire } from "@/lib/i18n/fr"

// --- Types ---
type Article     = { id: number; nom: string; description?: string; image?: string }
type SlotArticle = { article: Article }
type Slot        = { id: number; nom: string; capacite: number; quantiteParUnite: number; articles: SlotArticle[] }
type Categorie   = { id: number; nom: string; creneaux?: string[] }
type Formule     = { id: number; nom: string; prix: number; description: string | null; minPersonnes: number; pasPersonnes: number; unite: string; categorie: Categorie; slots: Slot[] }
type Extra       = { id: number; nom: string; prix: number; description?: string; image?: string }

// ── Fonctions pures ────────────────────────────────────────────────────────
// Aucune ne lit ni ne modifie l'état : on peut les déclarer hors du composant,
// donc les écrire une seule fois pour toute la vie de la page au lieu d'une
// fois par rendu. C'est aussi ce qui les rend testables isolément.

// Intl connaît les conventions de chaque langue : « 34,90 € » en français,
// « €34.90 » en anglais. Concaténer un symbole à la main donnait un format
// français à tout le monde.
const euro = (n: number, langue: Langue) =>
  new Intl.NumberFormat(langue === "en" ? "en-GB" : "fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n)

// Clé composite plutôt que le seul articleId : SlotArticle est une table de
// liaison, un même article PEUT être rattaché à deux créneaux (un jus de
// pomme proposé à la fois dans « Jus » et dans « Boissons »). Avec une clé
// articleId seule, les deux créneaux partageraient le même compteur.
const cleLigne = (slotId: number, articleId: number) => `${slotId}:${articleId}`

// Combien d'unités ce créneau réclame pour nbPersonnes.
// Le calcul lui-même vit dans lib/formule.ts : la validation serveur
// (lib/panier.ts) appelle exactement la même fonction, ce qui garantit que
// l'écran et la commande ne peuvent pas compter différemment.
const cibleDe = (slot: Slot, nbPersonnes: number) =>
  cibleSlot(nbPersonnes, slot.capacite, slot.quantiteParUnite)

const sommeDe = (slot: Slot, quantites: Record<string, number>) =>
  slot.articles.reduce((total, sa) => total + (quantites[cleLigne(slot.id, sa.article.id)] ?? 0), 0)

// Un créneau qui ne propose qu'un seul article n'est pas un choix : il est
// compris d'office, on ne fait pas cliquer le client dessus.
const estAChoisir = (slot: Slot) => slot.articles.length > 1

/**
 * Phrase expliquant la règle d'un créneau. Les quatre cas correspondent aux
 * quatre combinaisons des deux réglages : partagé ou non, en plusieurs
 * exemplaires ou non. Les énoncer explicitement plutôt que d'assembler des
 * bouts de phrase évite les formulations bancales du type « 1 par personne
 * pour 1 personnes ».
 */
function regleDuSlot(
  slot: Slot,
  unite: string,
  cible: number,
  nbUnites: number,
  t: Dictionnaire,
  langue: Langue
) {
  const q = Math.max(1, slot.quantiteParUnite || 1)
  const c = Math.max(1, slot.capacite || 1)
  const parLot = `${c} ${libelleUnite(unite, c, langue)}`
  const total  = `${cible} ${t.commander.regleRepartir} ${nbUnites} ${libelleUnite(unite, nbUnites, langue)}.`

  if (c > 1 && q > 1) return `${q} ${t.commander.reglePour} ${parLot} : ${total}`
  if (c > 1)          return `1 ${t.commander.reglePour} ${parLot} : ${total}`
  if (q > 1)          return `${q} ${t.commander.regleParUnite} ${libelleUnite(unite, 1, langue)} : ${total}`
  return `${t.commander.regleUn} ${libelleUnite(unite, 1, langue)}${t.commander.regleLibre}`
}

/**
 * Quand le nombre de personnes baisse, un créneau peut se retrouver au-dessus
 * de son quota : 20 cafés répartis pour 20 personnes, puis on repasse à 10.
 * On retire les unités en trop sur l'article le plus chargé, jusqu'à revenir
 * dans les clous. Sans ça, le bouton « Ajouter au panier » resterait bloqué
 * sur une erreur que le client n'aurait aucun moyen de comprendre.
 */
function ecreter(quantites: Record<string, number>, slots: Slot[], nbPersonnes: number) {
  const suivant = { ...quantites }
  for (const slot of slots) {
    if (!estAChoisir(slot)) continue
    let excedent = sommeDe(slot, suivant) - cibleDe(slot, nbPersonnes)
    while (excedent > 0) {
      const plusCharge = slot.articles.reduce((a, b) =>
        (suivant[cleLigne(slot.id, a.article.id)] ?? 0) >= (suivant[cleLigne(slot.id, b.article.id)] ?? 0) ? a : b
      )
      const cle = cleLigne(slot.id, plusCharge.article.id)
      suivant[cle] = (suivant[cle] ?? 0) - 1
      excedent--
    }
  }
  return suivant
}

export default function CommanderPage() {
  const { id }      = useParams()
  const { addItem } = useCart()
  const { t, langue } = useLang()

  const [formule, setFormule] = useState<Formule | null>(null)
  const [extras, setExtras]   = useState<Extra[]>([])
  const [ajoute, setAjoute]   = useState(false)
  // Distinct de "formule === null", qui signifie « pas encore chargée ».
  // Sans ce troisième état, une formule introuvable resterait bloquée sur
  // « Chargement... » indéfiniment.
  const [introuvable, setIntrouvable] = useState(false)

  // ── Les deux seules sources de vérité ──
  // Tout le reste (quotas, totaux, complétude) en est DÉRIVÉ à chaque rendu.
  // Stocker un total dans un state supplémentaire, c'est s'exposer à ce qu'il
  // se désynchronise du jour où on oublie de le mettre à jour quelque part.
  const [nbPersonnes, setNbPersonnes] = useState(1)
  const [quantites, setQuantites]     = useState<Record<string, number>>({})

  const [extraQty, setExtraQty] = useState<Record<number, number>>({})

  // Signalement visuel du premier créneau incomplet quand on clique sur
  // « Ajouter au panier » sans avoir tout réparti.
  const [slotSignale, setSlotSignale] = useState<number | null>(null)
  const refsSlots = useRef<Record<number, HTMLElement | null>>({})
  const minuteur  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/formules/${id}`)
      // res.json() réussit même sur un 404 : la route répond
      // { error: "Formule introuvable" }, qui est du JSON parfaitement
      // valide. Sans ce test sur res.ok, cet objet d'erreur était stocké
      // comme s'il s'agissait d'une formule, et la page plantait un peu
      // plus loin sur formule.categorie.id.
      .then(res => (res.ok ? res.json() : Promise.reject(new Error("introuvable"))))
      .then(data => {
        // Deuxième filet : une réponse 200 qui n'aurait ni catégorie ni
        // créneaux n'est pas exploitable non plus.
        if (!data?.categorie || !Array.isArray(data.slots)) {
          throw new Error("réponse inattendue")
        }
        setFormule(data)
      })
      // Couvre aussi la panne réseau : dans les deux cas le client ne peut
      // pas commander, et mieux vaut le lui dire que le laisser attendre.
      .catch(() => setIntrouvable(true))
  }, [id])

  // Les extras dépendent de la catégorie de la formule : impossible de les
  // demander avant de l'avoir reçue. Les deux requêtes s'enchaînent donc au
  // lieu de partir en parallèle. Le coût est d'un aller-retour réseau ; le
  // gain est qu'on ne propose plus de croissants avec un plateau apéro.
  useEffect(() => {
    if (!formule) return
    fetch(`/api/extras?categorieId=${formule.categorie.id}`)
      .then(res => res.json())
      .then(data => setExtras(data))
  }, [formule])

  // La quantité démarre au minimum réglé dans le dashboard : la même règle
  // que celle vérifiée côté serveur par lib/panier.ts.
  useEffect(() => {
    if (formule) setNbPersonnes(formule.minPersonnes)
  }, [formule])

  // Le minuteur du signalement doit être annulé si on quitte la page avant
  // son échéance : sinon React avertit d'une mise à jour sur un composant
  // démonté.
  useEffect(() => () => {
    if (minuteur.current) clearTimeout(minuteur.current)
  }, [])

  const slots = useMemo(() => formule?.slots ?? [], [formule])
  // Exactement 1 article, et non « pas à choisir » : un créneau vide (créé
  // sans article dans le dashboard, ou dont tout le stock est indisponible)
  // ferait planter l'affichage sur slot.articles[0].article.
  const slotsInclus   = useMemo(() => slots.filter(s => s.articles.length === 1), [slots])
  const slotsAChoisir = useMemo(() => slots.filter(estAChoisir), [slots])

  // ── États dérivés ──
  const etats = useMemo(
    () => slotsAChoisir.map(slot => {
      const cible = cibleDe(slot, nbPersonnes)
      const total = sommeDe(slot, quantites)
      return { slot, cible, total, complet: total >= cible }
    }),
    [slotsAChoisir, nbPersonnes, quantites]
  )

  const manquants = etats.reduce((somme, e) => somme + Math.max(0, e.cible - e.total), 0)
  const complet   = manquants === 0

  const totalFormule = formule ? formule.prix * nbPersonnes : 0
  const totalExtras  = extras.reduce((somme, e) => somme + (extraQty[e.id] ?? 0) * e.prix, 0)
  const total        = totalFormule + totalExtras

  // ── Actions ──

  function definirQuantite(slot: Slot, articleId: number, valeur: number) {
    setQuantites(precedent => {
      // Number.isFinite écarte NaN, que produit parseInt("") quand le client
      // vide le champ au clavier.
      let v = Math.max(0, Number.isFinite(valeur) ? Math.floor(valeur) : 0)
      const cle = cleLigne(slot.id, articleId)
      // On ne peut pas dépasser le quota du créneau : ce qui reste disponible,
      // c'est la cible moins ce qui est déjà posé sur les AUTRES articles.
      const dejaPris = sommeDe(slot, precedent) - (precedent[cle] ?? 0)
      const reste    = cibleDe(slot, nbPersonnes) - dejaPris
      v = Math.min(v, Math.max(0, reste))
      return { ...precedent, [cle]: v }
    })
  }

  function changeNbPersonnes(delta: number) {
    if (!formule) return
    const pas = formule.pasPersonnes
    const cible = Math.max(formule.minPersonnes, nbPersonnes + (delta > 0 ? pas : -pas))
    setNbPersonnes(cible)
    // On écrête DANS la foulée, avec la nouvelle valeur : la répartition doit
    // toujours rester compatible avec la quantité affichée.
    setQuantites(precedent => ecreter(precedent, slots, cible))
  }

  function changeExtra(extraId: number, valeur: number) {
    setExtraQty(precedent => {
      const v = Math.max(0, Number.isFinite(valeur) ? Math.floor(valeur) : 0)
      if (v === 0) {
        // On retire la clé au lieu de stocker 0 : `Object.keys(extraQty)`
        // reflète alors exactement les extras réellement commandés.
        const { [extraId]: _retire, ...reste } = precedent
        return reste
      }
      return { ...precedent, [extraId]: v }
    })
  }

  function ajouterAuPanier() {
    if (!formule) return

    // Pas de cul-de-sac : si la répartition est incomplète, on emmène le
    // client là où il doit agir plutôt que de laisser un bouton inerte.
    const incomplet = etats.find(e => !e.complet)
    if (incomplet) {
      refsSlots.current[incomplet.slot.id]?.scrollIntoView({ behavior: "smooth", block: "center" })
      setSlotSignale(incomplet.slot.id)
      if (minuteur.current) clearTimeout(minuteur.current)
      minuteur.current = setTimeout(() => setSlotSignale(null), 1400)
      return
    }

    const lignes: LigneSelection[] = []
    for (const slot of slots) {
      // Créneau vide : rien à envoyer. Le serveur refusera la commande avec
      // un message explicite plutôt que de livrer un panier amputé.
      if (slot.articles.length === 0) continue
      if (!estAChoisir(slot)) {
        // Créneau à article unique : sa quantité se déduit, le client n'a
        // rien eu à saisir. Il part quand même en commande.
        const article = slot.articles[0].article
        lignes.push({
          slotId: slot.id, slotNom: slot.nom,
          articleId: article.id, articleNom: article.nom,
          quantite: cibleDe(slot, nbPersonnes),
        })
        continue
      }
      for (const sa of slot.articles) {
        const quantite = quantites[cleLigne(slot.id, sa.article.id)] ?? 0
        if (quantite > 0) {
          lignes.push({
            slotId: slot.id, slotNom: slot.nom,
            articleId: sa.article.id, articleNom: sa.article.nom,
            quantite,
          })
        }
      }
    }

    addItem({
      formuleId:   formule.id,
      formuleNom:  formule.nom,
      formulePrix: formule.prix,
      nbPersonnes,
      unite:       formule.unite,
      categorieId:  formule.categorie.id,
      categorieNom: formule.categorie.nom,
      creneaux:     formule.categorie.creneaux ?? [],
      lignes,
      extras: extras
        .filter(e => extraQty[e.id])
        .map(e => ({ extraId: e.id, nom: e.nom, prix: e.prix, quantite: extraQty[e.id] })),
      subtotal: total,
    })

    setAjoute(true)
  }

  if (introuvable) {
    return (
      <main className="commander">
        <div className="choix-carte">
          <Link href="/#formules" className="commander-back">{t.commander.retour}</Link>
          <h1 className="choix-titre">{t.commander.introuvableTitre} <em>{t.commander.introuvableEm}</em></h1>
          <p className="choix-chapeau">{t.commander.introuvableTexte}</p>
          <div className="choix-pied">
            <Link href="/#formules" className="choix-btn-principal">{t.commander.introuvableCta}</Link>
          </div>
        </div>
      </main>
    )
  }

  if (!formule) return <div className="commander-loading">{t.commander.chargement}</div>

  return (
    <main className="commander">
      <div className="choix-carte">

        <header className="choix-entete">
          <div>
            <Link href="/#formules" className="commander-back">{t.commander.retour}</Link>
            {/* Le nom de la formule reste en français : c'est un nom commercial. */}
            <h1 className="choix-titre">{t.commander.titre} <em>{formule.nom}</em></h1>
          </div>
          <span className="choix-badge">
            {euro(formule.prix, langue)} / {uniteCourte(formule.unite, langue)}
          </span>
        </header>

        <Stepper courante={2} t={t} />

        <h2 className="choix-section">{t.commander.section}</h2>
        {formule.description && (
          <p className="choix-chapeau">{traduireContenu(formule.description, langue)}</p>
        )}

        {/* {slotsAChoisir.length > 0 && (
          <p className="choix-astuce">
            {t.commander.astuce}
          </p>
        )} */}

        <div className="choix-quantite">
          <div className="choix-quantite-label">
            {t.commander.quantiteLabel} {libelleUnite(formule.unite, 2, langue)}
            <small>
              {t.commander.aPartirDe} {formule.minPersonnes}
              {formule.pasPersonnes > 1 && `${t.commander.parTranche} ${formule.pasPersonnes}`}
            </small>
          </div>
          <Compteur
            valeur={nbPersonnes}
            libelle={libelleUnite(formule.unite, 1, langue)}
            t={t}
            // Pas de saisie libre ici : minPersonnes et pasPersonnes imposent
            // des valeurs discrètes (4, 8, 12…) que les boutons garantissent.
            lectureSeule
            onChange={() => {}}
            onIncrement={() => changeNbPersonnes(1)}
            onDecrement={() => changeNbPersonnes(-1)}
            moinsDesactive={nbPersonnes <= formule.minPersonnes}
          />
        </div>

        {slotsInclus.length > 0 && (
          <section className="choix-inclus">
            <h3>{t.commander.inclus}</h3>
            <ul>
              {slotsInclus.map(slot => {
                const article = slot.articles[0].article
                return (
                  <li key={slot.id}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                    {cibleDe(slot, nbPersonnes) > 1 && (
                      <strong>{cibleDe(slot, nbPersonnes)}× </strong>
                    )}
                    {slot.nom === article.nom
                      ? traduireContenu(article.nom, langue)
                      : `${traduireContenu(slot.nom, langue)} : ${traduireContenu(article.nom, langue)}`}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {etats.map(({ slot, cible, total: pose, complet: slotComplet }) => (
          <section
            key={slot.id}
            ref={el => { refsSlots.current[slot.id] = el }}
            className={`choix-slot ${slotSignale === slot.id ? "choix-slot-signale" : ""}`}
          >
            <div className="choix-slot-tete">
              <h3>{traduireContenu(slot.nom, langue)}</h3>
              <span className={`choix-quota ${slotComplet ? "choix-quota-plein" : ""}`}>
                <span>{pose} / {cible}</span>
                {slotComplet && <span aria-hidden="true">✓</span>}
              </span>
            </div>
            <p className="choix-regle">
              {regleDuSlot(slot, formule.unite, cible, nbPersonnes, t, langue)}
            </p>

            {slot.articles.map(sa => (
              <LigneArticle
                key={sa.article.id}
                nom={traduireContenu(sa.article.nom, langue)}
                note={traduireContenu(sa.article.description, langue) || undefined}
                t={t}
                valeur={quantites[cleLigne(slot.id, sa.article.id)] ?? 0}
                plusDesactive={slotComplet}
                onChange={v => definirQuantite(slot, sa.article.id, v)}
              />
            ))}
          </section>
        ))}

        {extras.length > 0 && (
          <section className="choix-slot choix-extras">
            <div className="choix-slot-tete">
              <h3>{t.commander.extrasTitre}</h3>
            </div>
            <p className="choix-regle">{t.commander.extrasTexte}</p>
            {extras.map(extra => (
              <LigneArticle
                key={extra.id}
                nom={traduireContenu(extra.nom, langue)}
                note={traduireContenu(extra.description, langue) || undefined}
                prix={extra.prix}
                langue={langue}
                t={t}
                valeur={extraQty[extra.id] ?? 0}
                onChange={v => changeExtra(extra.id, v)}
              />
            ))}
          </section>
        )}

        {/* Un <div> et non un <footer> : la feuille de style du site cible
            footer par son NOM D'ÉLÉMENT (fond marron, padding), ce qui
            s'appliquait donc aussi à ce bloc-ci.
            Le total et le bouton d'ajout vivent uniquement dans la barre
            fixe du bas, visible en permanence : les dupliquer ici obligeait
            le client à se demander si les deux boutons font la même chose. */}
        <div className="choix-pied">
          <Link href="/#formules" className="choix-btn-secondaire">{t.commander.retourBouton}</Link>
        </div>

      </div>

      {/* Barre fixe : le total et l'état de complétude restent lisibles quelle
          que soit la position dans la page, sans dupliquer un récapitulatif
          en colonne. */}
      <div className="choix-flottante">
        <div className="choix-flottante-in">
          <p className="choix-etat">
            <span className={`choix-pastille ${complet ? "" : "choix-pastille-attente"}`} />
            {complet
              ? t.commander.complet
              : `${t.commander.resteAChoisir} ${manquants} ${t.commander.resteAChoisirSuite}`}
          </p>
          <div className="choix-flottante-droite">
            <span className="choix-somme">{t.commander.total} <b>{euro(total, langue)}</b></span>
            <button
              type="button"
              className={`choix-btn-principal ${complet ? "" : "choix-btn-attente"}`}
              onClick={ajouterAuPanier}
            >
              {t.commander.ajouter}
            </button>
          </div>
        </div>
      </div>

      {ajoute && (
        <div className="choix-modale" role="dialog" aria-modal="true" aria-labelledby="ajout-titre">
          <div className="choix-modale-boite">
            <span className="choix-modale-icone">✓</span>
            <h2 id="ajout-titre">{t.commander.ajouteTitre}</h2>
            <p>{formule.nom} — {nbPersonnes} {libelleUnite(formule.unite, nbPersonnes, langue)}</p>
            {/* Les deux actions QUITTENT la page. L'ancienne version se
                contentait de fermer la modale : le client se retrouvait sur
                la formule qu'il venait d'ajouter, quantités intactes, sans
                rien de visible pour lui indiquer que son clic avait été pris
                en compte. Un bouton qui ne mène nulle part passe pour cassé.

                Link et non router.push : Next précharge la destination au
                survol, et le clic-milieu ou Ctrl+clic ouvre un nouvel onglet,
                ce qu'un gestionnaire onClick ne permet pas. */}
            <div className="choix-modale-actions">
              <Link href="/#formules" className="choix-btn-secondaire">
                {t.commander.continuer}
              </Link>
              <Link href="/panier" className="choix-btn-principal">
                {t.commander.voirPanier}
              </Link>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

// ── Sous-composants ────────────────────────────────────────────────────────
// Déclarés au niveau du module, PAS dans CommanderPage. Un composant défini
// à l'intérieur d'un autre est recréé à chaque rendu du parent : React voit
// un type de composant différent, démonte l'ancien et remonte le neuf. Avec
// un <input> à l'intérieur, cela se traduirait par une perte du focus à
// chaque frappe.

// t et langue descendent en PROPS plutot que par useLang().
//
// Ces composants sont declares hors de CommanderPage : ils pourraient appeler
// le hook eux-memes, mais recevoir leurs textes rend leur dependance visible
// dans la signature, et les garde testables isolement.
function LigneArticle({ nom, note, prix, valeur, onChange, plusDesactive, t, langue }: {
  nom: string
  note?: string
  prix?: number
  valeur: number
  onChange: (v: number) => void
  plusDesactive?: boolean
  t: Dictionnaire
  langue?: Langue
}) {
  return (
    <div className={`choix-ligne ${valeur > 0 ? "choix-ligne-active" : ""}`}>
      <div className="choix-nom">
        {nom}
        {note && <small>{note}</small>}
      </div>
      {prix != null && <span className="choix-prix">{euro(prix, langue ?? "fr")}</span>}
      <Compteur
        valeur={valeur}
        libelle={nom}
        t={t}
        onChange={onChange}
        onIncrement={() => onChange(valeur + 1)}
        onDecrement={() => onChange(valeur - 1)}
        moinsDesactive={valeur === 0}
        plusDesactive={plusDesactive}
      />
    </div>
  )
}

function Compteur({ valeur, onChange, onIncrement, onDecrement, libelle, moinsDesactive, plusDesactive, lectureSeule, t }: {
  valeur: number
  onChange: (v: number) => void
  onIncrement: () => void
  onDecrement: () => void
  libelle: string
  moinsDesactive?: boolean
  plusDesactive?: boolean
  lectureSeule?: boolean
  t: Dictionnaire
}) {
  return (
    <div className="choix-compteur">
      <button type="button" onClick={onDecrement} disabled={moinsDesactive} aria-label={`${t.commander.retirerUn} ${libelle}`}>
        −
      </button>
      <input
        type="number"
        value={valeur}
        min={0}
        readOnly={lectureSeule}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        // select() au focus : le client tape « 12 » et remplace la valeur,
        // au lieu d'obtenir « 012 » en écrivant devant le zéro existant.
        onFocus={e => e.target.select()}
        aria-label={`${t.commander.quantiteDe} ${libelle}`}
      />
      <button type="button" className="choix-plus" onClick={onIncrement} disabled={plusDesactive} aria-label={`${t.commander.ajouterUn} ${libelle}`}>
        +
      </button>
    </div>
  )
}

// Trois étapes et non quatre : le panier regroupe la livraison, le
// récapitulatif et le paiement sur une seule page. Un indicateur qui
// annoncerait une étape de plus que la réalité serait pire que pas
// d'indicateur du tout.
function Stepper({ courante, t }: { courante: number; t: Dictionnaire }) {
  const ETAPES = [t.commander.etape1, t.commander.etape2, t.commander.etape3]

  return (
    <div className="choix-stepper">
      <div className="choix-rail">
        <span style={{ width: `${(courante / ETAPES.length) * 100}%` }} />
      </div>
      <ol className="choix-etapes">
        {ETAPES.map((libelle, i) => {
          const numero = i + 1
          const faite  = numero < courante
          const active = numero === courante
          return (
            <li
              key={libelle}
              className={`choix-et ${faite ? "choix-et-faite" : ""} ${active ? "choix-et-active" : ""}`}
              aria-current={active ? "step" : undefined}
            >
              <span className="choix-rond">{faite ? "✓" : numero}</span>
              {libelle}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
