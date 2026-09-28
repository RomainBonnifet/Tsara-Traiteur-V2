// Dictionnaire anglais.
//
// Typé `Dictionnaire`, c'est-à-dire la forme exacte du dictionnaire français.
// TypeScript refuse donc de compiler si une clé manque, est en trop ou porte
// un nom mal orthographié : impossible d'oublier une traduction en silence.

import type { Dictionnaire } from "./fr"

const en: Dictionnaire = {
  nav: {
    formules: "Our offers",
    galerie: "Gallery",
    partenaires: "Partners",
    contact: "Contact",
    admin: "Admin",
    deconnexion: "Log out",
    connexion: "Log in",
    panier: "Basket",
    menu: "Menu",
    langue: "Change language",
  },

  hero: {
    eyebrow: "Artisan caterer · Gironde",
    titre1: "From the first coffee,",
    titre2: "to the last glass",
    titre3: "shared",
    sousTitre:
      "Breakfasts, buffets and after-work platters delivered across the Libourne area, made with produce from nearby farms and artisans.",
    ctaDevis: "Request a quote",
    ctaCommander: "Order online",
  },

  about: {
    label: "Who we are",
    titre: "A caterer devoted to",
    titreEm: "local flavours",
    p1: "Tsara is a caterer specialising in artisan farmhouse breakfasts, made with local, fresh and seasonal produce sourced directly from partner farms and craftspeople.",
    p2: "Every spread is 100% homemade, designed for quality, taste and balance, while supporting short supply chains and responsible sourcing.",
    valeur1Titre: "Short supply chains",
    valeur1Texte: "Local producers chosen with care",
    valeur2Titre: "Flexible delivery",
    valeur2Texte: "To your home, holiday cottage, guesthouse or business meeting",
    valeur3Titre: "Artisan & responsible",
    valeur3Texte: "Homemade pastries, local juice and farm produce",
  },

  afterwork: {
    label: "After-work & drinks",
    titre: "After-work drinks,",
    titreEm: "the local way.",
    texte:
      "After a day's work, a meeting, or simply to get together, Tsara delivers a ready-to-share aperitif straight to the place of your choice.",
    tags: ["Terrines", "Cured sausage", "Spreads", "Artisan crisps", "Fresh bread"],
    carte1Titre: "Team after-work",
    carte1Texte: "A meeting, a seminar or a relaxed moment with colleagues.",
    carte2Titre: "Drinks at home",
    carte2Texte: "At home, in a holiday cottage or at your venue.",
    cta: "Book an after-work",
  },

  prestations: {
    label: "What we offer",
    titre1: "For your",
    titreEm1: "private events",
    titre2: "or",
    titreEm2: "business occasions",
    p1: "The morning after a wedding, a christening, a birthday, a stag or hen party, at the office or during a seminar with colleagues — Tsara adapts to every occasion. Enjoy a turnkey delivery designed to take the organising off your hands so you can simply savour the moment.",
    p2: "Based in Saint-Médard-de-Guizières, we cover the Libourne area, Bordeaux and the whole Gironde region.",
    cta: "Request a quote",
  },

  services: {
    label: "What we offer",
    titre: "Our",
    titreEm: "services",
    sousTitre: "Designed to suit every occasion",
    s1Titre: "Breakfast delivery",
    s1Texte:
      "We deliver around Coutras, in particular to Libourne, Saint-Émilion, Castillon-la-Bataille and Montpon-Ménestérol. We adapt to your schedule and delivery location.",
    s2Titre: "Aperitif delivery",
    s2Texte: "Charcuterie and cheese boards, snacks and craft beers.",
    s2Avertissement:
      "Excessive drinking is harmful to your health. Please drink responsibly.",
    s3Titre: "Full catering service",
    s3Texte:
      "We take care of setting up the buffet, laying everything out and serving your guests, so you can enjoy their company to the full.",
    zoneLocale: "Within 20 km of Coutras",
    zoneRegion: "Across the whole region",
  },

  formules: {
    categories: {
      "Petit-déjeuner": {
        label: "Breakfasts delivered",
        titre: "Our",
        titreEm: "Breakfast offers",
        intro:
          "You choose, we select the produce, prepare your order and deliver it wherever you like.",
      },
      "Apéro": {
        label: "Aperitif platters delivered",
        titre: "Our",
        titreEm: "Aperitif offers",
        intro:
          "Charcuterie, spreads and produce from our growers, arranged and delivered ready to share.",
      },
    },
    livraisonTitre: "Delivery included",
    livraisonTexte: "Within 20 km of Saint-Médard-de-Guizières.",
    paiementTitre: "Pay online or on delivery",
    paiementTexte:
      "Pay by card when you order, or on the spot at delivery, by card or in cash.",
    badge: "Most popular",
    aPartirDe: "From",
    auChoix: "your choice",
    auChoixListe: "your choice of:",
    cta: "Build my order",
  },

  galerie: {
    label: "Our work",
    titre: "The",
    titreEm: "gallery",
    lien: "See all photos →",
  },

  partenaires: {
    label: "Partner growers & artisans",
    titre: "The taste of the region, in good hands.",
    baseline:
      "Produce sourced from farms, growers and craftspeople in our region.",
  },

  avis: {
    label: "Your feedback",
    titre: "What people say",
    titreEm: "about Tsara.",
    texte:
      "The satisfaction of everyone who shares a Tsara breakfast or after-work platter is at the heart of what we do.",
    noteLabel: "Google rating",
    etoiles: "stars out of",
    lien: "See our Google listing",
  },

  contact: {
    label: "Get in touch",
    titre: "Book your",
    titreEm: "breakfast",
    texte:
      "We handle everything. Just tell us what you have in mind, how many guests and the date.",
    nom: "First & last name",
    nomPlaceholder: "Marie Dupont",
    telephone: "Phone",
    telephonePlaceholder: "+33 6 XX XX XX XX",
    email: "Email",
    emailPlaceholder: "marie@example.com",
    prestation: "Type of service",
    prestationVide: "Select...",
    prestation1: "Delivery to your home",
    prestation2: "Seminar",
    prestation3: "Holiday cottage / Guesthouse",
    prestation4: "Other",
    date: "Preferred date",
    nbPersonnes: "Number of guests",
    message: "Message",
    messagePlaceholder: "Tell us what you would like...",
    envoyer: "Send my request",
    envoiEnCours: "Sending...",
    erreur: "Something went wrong, please try again.",
    succes: "✓ Your request has been sent!",
    succesSuite: "We will get back to you very shortly.",
    nouvelleDemande: "Send another request",
  },

  footer: {
    apropos: "About",
    formules: "Our offers",
    galerie: "Gallery",
    partenaires: "Partners",
    contact: "Contact",
    cgv: "Terms and Conditions of Sale",
    mentions: "Legal notice",
  },

  commander: {
    chargement: "Loading...",
    retour: "← Back to our offers",
    introuvableTitre: "Offer",
    introuvableEm: "not found",
    introuvableTexte:
      "This offer no longer exists or its address has changed. You will find our current offers on the home page.",
    introuvableCta: "See our offers",
    etape1: "Your offer",
    etape2: "Your choices",
    etape3: "Delivery & payment",
    titre: "Offer",
    section: "Your choices",
    astuce:
      "Share out the items included in your offer: 2 coffees and 2 teas means two servings of coffee and two of tea.",
    quantiteLabel: "Number of",
    aPartirDe: "From",
    parTranche: ", in steps of",
    inclus: "Included in your order",
    regleParUnite: "per",
    regleUn: "One per",
    regleLibre: ", share them out as you like.",
    reglePour: "for",
    regleRepartir: "to share out across",
    extrasTitre: "Add extras",
    extrasTexte: "Items charged on top of the offer.",
    retourBouton: "← Back",
    ajouter: "Add to basket",
    complet: "Your offer is complete",
    resteAChoisir: "Still",
    resteAChoisirSuite: "choices to share out",
    total: "Total",
    ajouteTitre: "Added to basket",
    continuer: "Continue shopping",
    voirPanier: "View basket",
    retirerUn: "Remove one",
    ajouterUn: "Add one",
    quantiteDe: "Quantity:",
  },

  panier: {
    retour: "← Back to our offers",
    titre: "Your",
    titreEm: "basket",
    vide: "Your basket is empty.",
    videCta: "See our offers",
    supprimer: "Remove",
    extras: "Extras",
    sousTotal: "Subtotal",
    recapitulatif: "Summary",
    formule: "Offer",
    sousTotalParLivraison: "Subtotal per delivery",
    datesDeLivraison: "delivery dates",
    total: "Total",
    livraisonTitre: "Delivery details",
    email: "Email",
    emailPlaceholder: "you@example.com",
    emailAideCompte: "Your confirmation will be sent to your account address.",
    emailAideInvite: "So we can send you your order confirmation.",
    telephone: "Phone",
    telephonePlaceholder: "+33 6 12 34 56 78",
    dates: "Delivery dates",
    ajouterDate: "Add",
    retirerDate: "Remove the delivery on",
    datesAideVide:
      "Add one or more dates: a delivery will be prepared for each of them.",
    datesAide: "the basket is charged for each date.",
    livraison: "delivery",
    livraisons: "deliveries",
    creneau: "Delivery time",
    creneauVide: "-- Choose a time --",
    adresse: "Delivery address",
    adressePlaceholder: "12 rue des Fleurs, 33000 Bordeaux",
    adresseVerification: "Checking...",
    remarque: "Note (optional)",
    remarquePlaceholder:
      "Allergy, intolerance, item to swap, access instructions...",
    remarqueAide: "Passed on to the caterer exactly as written.",
    remarqueCompteur: "characters",
    paiement: "Payment",
    paiementEnLigne: "Pay online",
    paiementEnLigneAide: "Card payment, secured by Stripe.",
    paiementLivraison: "Pay on delivery",
    paiementLivraisonAide: "By card or in cash, on the spot.",
    chargement: "Loading...",
    confirmer: "Confirm my order",
    payer: "Pay online",
    erreurConnexion: "Could not connect. Please try again in a moment.",
    erreurCommande: "Your order could not be created.",
    vider: "Empty basket",
  },
  email: {
    sujet: "Order confirmation — Tsara Traiteur",
    entete: "Order confirmation",
    introARegler:
      "Thank you for your order! It has been registered. Here is your summary, to be paid on delivery.",
    introPayee: "Thank you for your order! Here is your order summary.",
    livraisonLe: "Delivery on",
    extras: "Extras:",
    remarqueTitre: "Customer note",
    totalARegler: "Total to pay on delivery",
    totalPaye: "Total paid",
    paiementSurPlace: "Payment on the spot, by card or in cash.",
    infosLivraison: "Delivery details",
    date: "Date",
    dates: "Dates",
    creneau: "Time",
    creneaux: "Times",
    creneauxDetail: "See each offer above for its delivery time",
    adresse: "Address",
    telephone: "Phone",
    question: "Any questions? Contact us at",
  },
  succes: {
    titre: "Order confirmed!",
    texteARegler:
      "Thank you for your order. You will pay on delivery, by card or in cash. A confirmation email has been sent to you.",
    textePayee:
      "Thank you for your order. You will receive a confirmation by email.",
    retour: "Back to home",
  },
}

export default en
