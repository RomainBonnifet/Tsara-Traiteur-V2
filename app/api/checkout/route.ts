import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { COOKIE_LANGUE, LANGUE_DEFAUT, estLangueValide } from "@/lib/i18n/config"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { getCurrentUser } from "@/lib/auth"
import { verifierRayon } from "@/lib/geo"
import { validerPanier } from "@/lib/panier"
import { estModePaiementValide, type ModePaiement } from "@/lib/statuts"
import { envoyerConfirmationCommande } from "@/lib/emailCommande"
import { libelleUnite } from "@/lib/formule"
import { estCreneauValide } from "@/lib/creneaux"

// Validation d'email volontairement permissive : on écarte les fautes de
// frappe grossières sans rejeter d'adresse exotique mais valide. La seule
// preuve qu'un email existe reste qu'un message y arrive.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// dates : tableau de chaines AAAA-MM-JJ. Volontairement typé unknown,
// il vient du navigateur : seule la validation ci-dessous fait foi.
// creneaux : objet { [categorieId]: "créneau choisi" }. Typé unknown comme
// dates : il vient du navigateur, seule la validation ci-dessous fait foi.
type Livraison = {
  email: string
  telephone: string
  dates: unknown
  adresse: string
  creneaux: unknown
  remarque?: unknown
}

// Un mois de livraisons d'avance : au-delà, c'est très probablement une
// erreur de saisie ou une requête forgée.
const MAX_DATES = 31

// La remarque est un texte libre recopié dans un email. On la borne : sans
// limite, rien n'empêcherait d'envoyer plusieurs mégaoctets de texte, qui
// seraient stockés puis expédiés au traiteur.
const MAX_REMARQUE = 500

export async function POST(req: NextRequest) {
  // 1. La connexion n'est pas obligatoire : currentUser peut être null.
  //    S'il existe, on rattache la commande à son compte ; sinon c'est
  //    une commande invitée.
  const currentUser = await getCurrentUser()

  const { items, livraison, modePaiement }: { items: unknown; livraison: Livraison | undefined; modePaiement: unknown } = await req.json()

  if (!livraison || typeof livraison !== "object") {
    return NextResponse.json({ error: "Informations de livraison manquantes." }, { status: 400 })
  }

  // Le mode de paiement vient du navigateur : seules les deux valeurs
  // prévues sont acceptées. Toute autre valeur est refusée, pas devinée.
  if (!estModePaiementValide(modePaiement)) {
    return NextResponse.json({ error: "Mode de paiement invalide." }, { status: 400 })
  }
  const mode: ModePaiement = modePaiement
  const aLaLivraison = mode === "livraison"

  // 1 bis. L'email remplace le compte comme moyen de joindre le client.
  //        Un compte connecté fournit le sien ; un invité doit le saisir.
  //        On valide côté serveur : le contrôle du navigateur est du confort,
  //        pas une sécurité — on peut appeler cette API sans passer par le
  //        formulaire.
  const compte = currentUser
    ? await prisma.user.findUnique({
        where: { id: currentUser.userId },
        select: { email: true },
      })
    : null

  const email = compte?.email ?? livraison.email?.trim() ?? ""

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Une adresse email valide est nécessaire pour confirmer la commande." },
      { status: 400 }
    )
  }

  // 1 bis². Les dates de livraison : une commande sera créée pour chacune.
  //         Le navigateur applique déjà ces règles, mais il ne décide rien.
  const aujourdhui = new Date().toISOString().slice(0, 10)

  // Set : deux fois la même date ne doit pas produire deux livraisons.
  const dates = Array.isArray(livraison.dates)
    ? Array.from(new Set(livraison.dates.filter((d): d is string => typeof d === "string")))
    : []

  if (dates.length === 0 || dates.length > MAX_DATES) {
    return NextResponse.json(
      { error: `Choisissez entre 1 et ${MAX_DATES} dates de livraison.` },
      { status: 400 }
    )
  }

  if (dates.some(d => !/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(new Date(d).getTime()))) {
    return NextResponse.json({ error: "Date de livraison invalide." }, { status: 400 })
  }

  // Une date ISO se compare et se trie comme du texte : "2026-09-02" est
  // bien avant "2026-09-10", sans conversion en objet Date.
  if (dates.some(d => d < aujourdhui)) {
    return NextResponse.json({ error: "Une des dates de livraison est déjà passée." }, { status: 400 })
  }
  dates.sort()

  // 1 ter. Le panier est revalidé et rechiffré à partir de la base.
  //        Plus aucun prix envoyé par le navigateur n'est utilisé ensuite.
  const panier = await validerPanier(items)
  if (!panier.ok) {
    return NextResponse.json({ error: panier.error }, { status: panier.status })
  }
  const { lignes } = panier

  // Langue du client, lue dans SON cookie et non dans le corps de la requête.
  // Le navigateur joint ses cookies à toute requête de même origine : la page
  // panier n'a donc rien à envoyer, et une requête forgée ne peut pas mentir
  // sur autre chose que sa propre langue — un enjeu nul.
  const cookieLangue = (await cookies()).get(COOKIE_LANGUE)?.value
  const langue = estLangueValide(cookieLangue) ? cookieLangue : LANGUE_DEFAUT

  // 1 quater. Un créneau par catégorie présente dans le panier.
  //           Les horaires autorisés viennent de la base (via validerPanier),
  //           jamais du navigateur : le formulaire ne propose que les bons,
  //           mais rien n'oblige à passer par le formulaire.
  const creneauxRecus = (livraison.creneaux ?? {}) as Record<string, unknown>
  if (typeof creneauxRecus !== "object" || creneauxRecus === null || Array.isArray(creneauxRecus)) {
    return NextResponse.json({ error: "Créneau de livraison manquant." }, { status: 400 })
  }

  // Map plutôt qu'objet : les clés d'un objet JSON sont des chaînes, alors
  // que categorieId est un nombre. Une Map garde le type des clés.
  const creneauParCategorie = new Map<number, string>()
  for (const ligne of lignes) {
    if (creneauParCategorie.has(ligne.categorieId)) continue

    const choix = creneauxRecus[String(ligne.categorieId)]
    if (!estCreneauValide(choix, ligne.creneauxCategorie)) {
      return NextResponse.json(
        { error: `Choisissez un créneau de livraison valide pour « ${ligne.categorieNom} ».` },
        { status: 400 }
      )
    }
    creneauParCategorie.set(ligne.categorieId, choix)
  }

  // Texte libre : on borne la longueur et on normalise la chaîne vide en
  // null, pour que la base distingue « rien écrit » de « écrit puis effacé ».
  const remarqueBrute = typeof livraison.remarque === "string" ? livraison.remarque.trim() : ""
  const remarque = remarqueBrute.length > 0 ? remarqueBrute.slice(0, MAX_REMARQUE) : null

  // Le rayon de livraison vaut pour toutes les formules. La condition qui
  // en exemptait les buffets de groupe a disparu avec eux : il n'y a plus
  // de catégorie livrée hors zone.
  const rayonCheck = await verifierRayon(livraison.adresse)
  if (!rayonCheck.ok) {
    return NextResponse.json({ error: rayonCheck.message }, { status: 422 })
  }

  // 2. Créer les commandes en base, une par formule du panier.
  //    Dans une transaction : si l'une échoue, aucune n'est enregistrée.
  //    Sans ça, un panier de deux formules pourrait n'être enregistré qu'à
  //    moitié, et le traiteur préparerait une commande incomplète.
  const orderIds = await prisma.$transaction(async (tx) => {
    const ids: number[] = []

    // Une commande par formule ET par date : le traiteur prépare une
    // livraison par jour, alors que le client n'a commandé qu'une fois.
    // flatMap produit toutes les paires (date, formule) d'un coup.
    const aCreer = dates.flatMap(date => lignes.map(ligne => ({ date, ligne })))

    for (const { date, ligne } of aCreer) {
      const order = await tx.order.create({
        data: {
          // null pour une commande invitée — c'est permis en base.
          userId: currentUser?.userId ?? null,
          email,
          formuleId: ligne.formuleId,
          nbPersonnes: ligne.nbPersonnes,
          // Montant recalculé côté serveur, converti des centimes en euros.
          montantTotal: ligne.montantCentimes / 100,
          modePaiement: mode,
          // En ligne : "en_attente" jusqu'à la confirmation du webhook Stripe.
          // À la livraison : la commande est confirmée tout de suite, il ne
          // reste qu'à l'encaisser sur place.
          statut: aLaLivraison ? "a_regler" : "en_attente",
          telephone: livraison.telephone,
          dateLivraison: new Date(date),
          // Une commande = une formule : elle reçoit donc le créneau de SA
          // catégorie. C'est ce qui permet de livrer le petit-déjeuner le
          // matin et le plateau apéro le soir, depuis une seule commande.
          creneauLivraison: creneauParCategorie.get(ligne.categorieId) ?? null,
          adresse: livraison.adresse,
          remarque,
          langue,
          // Sélections et extras déjà validés : une OrderItem par créneau
          // et par personne, une OrderExtra par extra.
          items: { create: ligne.selections },
          extras: { create: ligne.extras },
        }
      })
      ids.push(order.id)
    }

    return ids
    // Jusqu'à 31 dates × plusieurs formules : le délai par défaut de 5 s
    // serait trop court, on laisse de la marge.
  }, { timeout: 30000 })

  // 3a. Paiement à la livraison : ni Stripe, ni webhook. La commande est
  //     confirmée, on envoie l'email maintenant.
  if (aLaLivraison) {
    // La commande est enregistrée : un échec d'envoi d'email ne doit pas
    // faire croire au client qu'elle a échoué. On le journalise seulement.
    try {
      await envoyerConfirmationCommande(orderIds)
    } catch (err) {
      console.error("[checkout] commande enregistrée mais email non envoyé :", err)
    }
    return NextResponse.json({ url: "/commande/succes?mode=livraison" })
  }

  // 3b. Paiement en ligne : session Stripe Checkout.
  //     Noms et montants viennent de la base, jamais du navigateur.
  const lineItems = lignes.map(ligne => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: `Formule ${ligne.formuleNom}`,
        description: `${ligne.nbPersonnes} ${libelleUnite(ligne.unite, ligne.nbPersonnes)}` + (dates.length > 1 ? ` — ${dates.length} jours de livraison` : ""),
      },
      // Stripe travaille déjà en centimes : on transmet le montant tel quel.
      unit_amount: ligne.montantCentimes,
    },
    // Une unité facturée par date : Stripe affiche « × 3 » et multiplie
    // le montant lui-même, on ne recalcule rien à la main.
    quantity: dates.length,
  }))

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    customer_email: email,  // Stripe envoie le reçu à cet email
    metadata: { orderIds: orderIds.join(",") },
    success_url: `${process.env.NEXT_PUBLIC_URL}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/panier`,
  })

  return NextResponse.json({ url: session.url })
}
