// Dictionnaire français — la LANGUE DE RÉFÉRENCE.
//
// Son type (exporté sous le nom Dictionnaire) sert de contrat aux autres
// langues : en.ts est typé `Dictionnaire`, donc TypeScript refuse de compiler
// si une clé y manque ou si son nom est mal orthographié. On ne peut pas
// oublier une traduction silencieusement.
//
// Les clés suivent la structure du site (section.élément) plutôt que le texte
// français : renommer un titre ne doit pas obliger à renommer une clé partout.

const fr = {
  nav: {
    formules: "Formules",
    galerie: "Galerie",
    partenaires: "Partenaires",
    contact: "Contact",
    admin: "Admin",
    deconnexion: "Déconnexion",
    connexion: "Connexion",
    panier: "Panier",
    menu: "Menu",
    langue: "Changer de langue",
  },

  hero: {
    eyebrow: "Traiteur artisanal · Gironde",
    titre1: "Du premier café,",
    titre2: "au dernier verre",
    titre3: "partagé",
    sousTitre:
      "Petits-déjeuners, buffets et afterworks livrés dans le Libournais, préparés avec les produits de fermes et artisans de proximité.",
    ctaDevis: "Demander un devis",
    ctaCommander: "Commander en ligne",
  },

  about: {
    label: "Qui sommes-nous",
    titre: "Un traiteur au service des",
    titreEm: "saveurs locales",
    p1: "Tsara est un traiteur spécialisé dans les petits-déjeuners fermiers artisanaux, élaborés à partir de produits locaux, frais et de saison, directement issus de fermes et artisans partenaires.",
    p2: "Chaque composition est 100 % faite maison, pensée pour garantir qualité, goût et équilibre, tout en valorisant les circuits courts et une démarche responsable.",
    valeur1Titre: "Circuits courts",
    valeur1Texte: "Producteurs locaux sélectionnés avec soin",
    valeur2Titre: "Livraison flexible",
    valeur2Texte: "À domicile, en gîte, en chambre d'hôtes ou pour vos séminaires",
    valeur3Titre: "Artisanal & responsable",
    valeur3Texte: "Viennoiseries maison, jus local et produits de la ferme",
  },

  afterwork: {
    label: "Afterworks & apéros",
    titre: "L'afterwork,",
    titreEm: "version locale.",
    texte:
      "Après une journée de travail, une réunion ou simplement pour se retrouver, Tsara livre un apéritif prêt à partager directement sur le lieu de votre choix.",
    tags: ["Terrines", "Saucissons", "Tartinables", "Chips artisanales", "Pain frais"],
    carte1Titre: "Afterwork d'équipe",
    carte1Texte: "Réunion, séminaire ou moment convivial entre collaborateurs.",
    carte2Titre: "Apéro à domicile",
    carte2Texte: "À la maison, dans un gîte ou sur votre lieu de réception.",
    // Badge posé sur la photo. Il avait échappé à la traduction : un
    // visiteur anglophone lisait « Dès 18 h ».
    badge: "Dès 18 h",
    badgeSousTitre: "livré • prêt à partager",
    cta: "Demander un afterwork",
  },

  prestations: {
    label: "Nos prestations",
    titre1: "Pour vos",
    titreEm1: "évènements privés",
    titre2: "ou",
    titreEm2: "professionnels",
    p1: "Pour un lendemain de mariage, un baptême, un anniversaire, EVG, au bureau ou en séminaire entre collègues, Tsara s'adapte à chaque occasion. Profitez d'une livraison clé en main, pensée pour vous simplifier l'organisation et vous laisser savourer pleinement le moment.",
    p2: "Basés à Saint-Médard-de-Guizières, nous intervenons sur le Libournais, Bordeaux et l'ensemble de la région girondine.",
    cta: "Demander un devis",
  },

  services: {
    label: "Ce que nous proposons",
    titre: "Nos",
    titreEm: "services",
    sousTitre: "Conçus pour s'adapter à chaque occasion",
    s1Titre: "Livraison de petits-déjeuners",
    s1Texte:
      "Nous assurons la livraison aux alentours de Coutras, notamment à Libourne, Saint-Émilion, Castillon-la-Bataille et Montpon-Ménestérol. Nous nous adaptons à vos horaires et au lieu de livraison.",
    s2Titre: "Livraison d'apéritif",
    s2Texte: "Planches de charcuterie et de fromages, snacks et bières artisanales.",
    s2Avertissement:
      "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.",
    s3Titre: "Service traiteur",
    s3Texte:
      "Nous prenons en charge l'installation des buffets, la mise en place ainsi que le service, afin que vous puissiez profiter pleinement de vos invités.",
    zoneLocale: "20 km autour de Coutras",
    zoneRegion: "Dans toute la région",
  },

  formules: {
    // Habillage des catégories. La clé correspond au nom de la catégorie en
    // base : une catégorie absente d'ici s'affiche avec son nom brut.
    categories: {
      "Petit-déjeuner": {
        label: "Petits-déjeuners livrés",
        titre: "Nos formules",
        titreEm: "Petit-Déjeuner",
        intro:
          "Vous choisissez, nous sélectionnons les produits, préparons votre commande et la livrons au lieu convenu.",
      },
      "Apéro": {
        label: "Formules apéritives livrées",
        titre: "Nos formules",
        titreEm: "Apéro",
        intro:
          "Charcuterie, tartinables et produits de nos producteurs, dressés et livrés prêts à partager.",
      },
    } as Record<string, { label: string; titre: string; titreEm: string; intro: string }>,
    livraisonTitre: "Livraison comprise",
    livraisonTexte: "Dans un rayon de 20 km autour de Saint-Médard-de-Guizières.",
    paiementTitre: "Paiement en ligne ou à la livraison",
    paiementTexte:
      "Réglez par carte au moment de la commande, ou sur place à la livraison, par carte bancaire ou en espèces.",
    badge: "La plus choisie",
    aPartirDe: "À partir de",
    auChoix: "au choix",
    auChoixListe: "au choix :",
    cta: "Personnaliser ma formule",
  },

  galerie: {
    label: "Nos réalisations",
    titre: "La",
    titreEm: "galerie",
    lien: "Voir toutes les photos →",
  },

  partenaires: {
    label: "Producteurs & artisans partenaires",
    titre: "Le goût du territoire, en confiance.",
    baseline:
      "Des produits sélectionnés auprès de fermes, producteurs et artisans de notre territoire.",
  },

  avis: {
    label: "Vos retours",
    titre: "Ce que l'on dit",
    titreEm: "de Tsara.",
    texte:
      "La satisfaction de celles et ceux qui partagent un petit-déjeuner ou un afterwork Tsara est au cœur de notre démarche.",
    noteLabel: "Note Google",
    etoiles: "étoiles sur",
    lien: "Voir la fiche Google",
  },

  contact: {
    label: "Contactez-nous",
    titre: "Réservez votre",
    titreEm: "petit-déjeuner",
    texte:
      "Nous nous chargeons de tout. Dites-nous simplement vos envies, le nombre de convives et la date.",
    nom: "Prénom & Nom",
    nomPlaceholder: "Marie Dupont",
    telephone: "Téléphone",
    telephonePlaceholder: "06 XX XX XX XX",
    email: "Email",
    emailPlaceholder: "marie@exemple.fr",
    prestation: "Type de prestation",
    prestationVide: "Sélectionner...",
    prestation1: "Livraison à domicile",
    prestation2: "Séminaire",
    prestation3: "Gîte / Chambre d'hôtes",
    prestation4: "Autre",
    date: "Date souhaitée",
    nbPersonnes: "Nombre de personnes",
    message: "Message",
    messagePlaceholder: "Précisez vos souhaits...",
    envoyer: "Envoyer ma demande",
    envoiEnCours: "Envoi en cours...",
    erreur: "Une erreur est survenue, veuillez réessayer.",
    succes: "✓ Votre demande a bien été envoyée !",
    succesSuite: "Nous vous recontacterons très prochainement.",
    nouvelleDemande: "Envoyer une autre demande",
  },

  footer: {
    apropos: "À propos",
    formules: "Formules",
    galerie: "Galerie",
    partenaires: "Partenaires",
    contact: "Contact",
    cgv: "Conditions Générales de Vente",
    mentions: "Mentions légales",
  },

  // ── Tunnel de commande ──
  commander: {
    chargement: "Chargement...",
    retour: "← Retour aux formules",
    introuvableTitre: "Formule",
    introuvableEm: "introuvable",
    introuvableTexte:
      "Cette formule n'existe plus ou son adresse a changé. Retrouvez nos formules du moment sur la page d'accueil.",
    introuvableCta: "Voir les formules",
    etape1: "Votre formule",
    etape2: "Vos choix",
    etape3: "Livraison & paiement",
    titre: "Formule",
    section: "Vos choix",
    astuce:
      "Répartissez les articles compris dans la formule : 2 cafés et 2 thés, ce sont deux paniers café et deux paniers thé.",
    quantiteLabel: "Nombre de",
    aPartirDe: "À partir de",
    parTranche: ", par tranche de",
    inclus: "Compris dans votre commande",
    regleParUnite: "par",
    regleUn: "Un par",
    regleLibre: ", à répartir librement.",
    reglePour: "pour",
    regleRepartir: "à répartir pour",
    extrasTitre: "À ajouter en supplément",
    extrasTexte: "Articles facturés en plus de la formule.",
    retourBouton: "← Retour",
    ajouter: "Ajouter au panier",
    complet: "Votre formule est complète",
    resteAChoisir: "Il reste",
    resteAChoisirSuite: "choix à répartir",
    total: "Total",
    ajouteTitre: "Ajouté au panier",
    continuer: "Continuer mes achats",
    voirPanier: "Voir le panier",
    retirerUn: "Retirer un",
    ajouterUn: "Ajouter un",
    quantiteDe: "Quantité :",
  },

  panier: {
    retour: "← Retour aux formules",
    titre: "Votre",
    titreEm: "panier",
    vide: "Votre panier est vide.",
    videCta: "Voir les formules",
    supprimer: "Supprimer",
    extras: "Extras",
    sousTotal: "Sous-total",
    recapitulatif: "Récapitulatif",
    formule: "Formule",
    sousTotalParLivraison: "Sous-total par livraison",
    datesDeLivraison: "dates de livraison",
    total: "Total",
    livraisonTitre: "Informations de livraison",
    email: "Email",
    emailPlaceholder: "vous@exemple.fr",
    emailAideCompte: "Votre confirmation sera envoyée à l'adresse de votre compte.",
    emailAideInvite: "Pour recevoir votre confirmation de commande.",
    telephone: "Téléphone",
    telephonePlaceholder: "06 12 34 56 78",
    dates: "Dates de livraison",
    ajouterDate: "Ajouter",
    retirerDate: "Retirer la livraison du",
    datesAideVide:
      "Ajoutez une ou plusieurs dates : une livraison sera préparée pour chacune.",
    datesAide: "le panier est facturé pour chaque date.",
    livraison: "livraison",
    livraisons: "livraisons",
    creneau: "Créneau de livraison",
    creneauVide: "-- Choisir un créneau --",
    adresse: "Adresse de livraison",
    adressePlaceholder: "12 rue des Fleurs, 33000 Bordeaux",
    adresseVerification: "Vérification en cours...",
    remarque: "Remarque (facultatif)",
    remarquePlaceholder:
      "Allergie, intolérance, produit à remplacer, consigne d'accès...",
    remarqueAide: "Transmise telle quelle au traiteur avec votre commande.",
    remarqueCompteur: "caractères",
    paiement: "Paiement",
    paiementEnLigne: "Payer en ligne",
    paiementEnLigneAide: "Carte bancaire, paiement sécurisé par Stripe.",
    paiementLivraison: "Payer à la livraison",
    paiementLivraisonAide: "Carte bancaire ou espèces, sur place.",
    chargement: "Chargement...",
    confirmer: "Confirmer la commande",
    payer: "Payer en ligne",
    erreurConnexion: "Connexion impossible. Réessayez dans un instant.",
    erreurCommande: "La commande n'a pas pu être créée.",
    vider: "Vider le panier",
  },
  // ── Email de confirmation ──
  // Envoyé depuis le serveur (lib/emailCommande.ts). Ces clés ne servent
  // donc jamais dans un composant, mais elles vivent au même endroit que le
  // reste : une traduction oubliée est repérée par le même contrôle de type.
  email: {
    sujet: "Confirmation de commande — Tsara Traiteur",
    entete: "Confirmation de commande",
    introARegler:
      "Merci pour votre commande ! Elle est bien enregistrée. Voici le récapitulatif, à régler à la livraison.",
    introPayee: "Merci pour votre commande ! Voici le récapitulatif de votre commande.",
    livraisonLe: "Livraison le",
    extras: "Extras :",
    remarqueTitre: "Remarque du client",
    totalARegler: "Total à régler à la livraison",
    totalPaye: "Total payé",
    paiementSurPlace: "Paiement sur place, par carte bancaire ou en espèces.",
    infosLivraison: "Informations de livraison",
    date: "Date",
    dates: "Dates",
    creneau: "Créneau",
    creneaux: "Créneaux",
    creneauxDetail: "Voir le détail de chaque formule ci-dessus",
    adresse: "Adresse",
    telephone: "Téléphone",
    question: "Une question ? Contactez-nous à",
  },
  succes: {
    titre: "Commande confirmée !",
    texteARegler:
      "Merci pour votre commande. Vous la réglerez à la livraison, par carte bancaire ou en espèces. Un email de confirmation vous a été envoyé.",
    textePayee:
      "Merci pour votre commande. Vous recevrez une confirmation par email.",
    retour: "Retour à l'accueil",
  },
  // ── Commandes suspendues ──
  pause: {
    titre: "Commandes en ligne suspendues",
    explication:
      "Vous pouvez toujours nous écrire : nous répondons à chaque demande de devis.",
    contact: "Nous contacter",
    bouton: "Commandes suspendues",
    // Renvoyée par /api/checkout, donc visible même si le bouton a été
    // contourné ou si la pause a commencé pendant que le client remplissait
    // son panier.
    erreur:
      "Les commandes en ligne sont momentanément suspendues. Contactez-nous pour toute demande.",
  },
  // ── Textes alternatifs des images ──
  // Invisibles à l'écran, mais lus par les lecteurs d'écran et indexés
  // par Google Images : ils font partie du contenu du site.
  alt: {
    logo: "Logo Tsara",
    portrait: "Portrait Tsara Traiteur",
    afterwork: "Planche de charcuteries et fromages locaux pour un afterwork",
    seminaire: "Prestation séminaire Tsara",
    instagram: "Tsara sur Instagram",
    facebook: "Tsara sur Facebook",
    photo1: "Plateau petit-déjeuner Tsara",
    photo2: "Viennoiseries artisanales",
    photo3: "Produits locaux",
    photo4: "Préparation d'un plateau",
    photo5: "Petit-déjeuner en gîte",
  },

  // ── Connexion et inscription ──
  auth: {
    connexionTitre: "Se connecter",
    compteCree: "Compte créé avec succès ! Connectez-vous.",
    email: "Email",
    emailPlaceholder: "vous@exemple.com",
    motDePasse: "Mot de passe",
    motDePassePlaceholder: "8 caractères minimum",
    connexionEnCours: "Connexion...",
    pasDeCompte: "Pas encore de compte ?",
    sInscrire: "S'inscrire",
    inscriptionTitre: "Créer un compte",
    inscriptionEnCours: "Création...",
    creerMonCompte: "Créer mon compte",
    dejaUnCompte: "Déjà un compte ?",
  },

  // ── Page galerie ──
  galeriePage: {
    retour: "← Retour",
    vide: "Aucune photo pour l'instant.",
    photoParDefaut: "Photo Tsara Traiteur",
  },
  // ── Messages d'erreur renvoyés par les API ──
  //
  // Ils remontent tels quels dans l'interface : le panier affiche
  // data.error, les pages d'authentification aussi. Ils sont donc du
  // contenu visible, pas des journaux techniques.
  //
  // Les messages à trous sont des FONCTIONS et non des chaînes à assembler.
  // Deux raisons : l'ordre des mots change d'une langue à l'autre, et le
  // type de la fonction oblige la traduction à accepter exactement les
  // mêmes paramètres. Oublier un argument ne compile pas.
  erreurs: {
    // Panier
    panierInvalide: "Panier invalide.",
    panierVide: "Panier vide.",
    formuleRetiree: "Une formule de votre panier n'est plus proposée. Retirez-la de votre panier.",
    formuleHorsVente:
      "Une formule de votre panier n'est plus proposée à la vente en ligne. Retirez-la de votre panier.",
    nbPersonnes: (nom: string, min: number, pas: number) =>
      `Le nombre de personnes pour la formule ${nom} ne correspond plus aux conditions ` +
      `(à partir de ${min}, par tranche de ${pas}). Retirez-la et ajoutez-la à nouveau.`,
    articleIndisponible: (nom: string) =>
      `Un article choisi pour la formule ${nom} n'est plus disponible. Retirez la formule et composez-la à nouveau.`,
    repartition: (slot: string, nom: string, cible: number) =>
      `La répartition de « ${slot} » pour la formule ${nom} ne correspond plus ` +
      `(${cible} attendu${cible > 1 ? "s" : ""}). Retirez la formule et composez-la à nouveau.`,
    extraIndisponible:
      "Un extra de votre panier n'est plus disponible. Retirez la formule et ajoutez-la à nouveau.",
    extraHorsFormule: (nom: string) =>
      `Un extra de votre panier n'est plus proposé avec la formule ${nom}. Retirez-la et ajoutez-la à nouveau.`,
    prixChange: (nom: string, montant: string) =>
      `Le prix de la formule ${nom} a changé depuis son ajout au panier ` +
      `(${montant} €). Retirez-la et ajoutez-la à nouveau.`,

    // Commande
    livraisonManquante: "Informations de livraison manquantes.",
    modePaiementInvalide: "Mode de paiement invalide.",
    emailRequis: "Une adresse email valide est nécessaire pour confirmer la commande.",
    nombreDeDates: (max: number) => `Choisissez entre 1 et ${max} dates de livraison.`,
    dateInvalide: "Date de livraison invalide.",
    datePassee: "Une des dates de livraison est déjà passée.",
    creneauManquant: "Créneau de livraison manquant.",
    creneauInvalide: (categorie: string) =>
      `Choisissez un créneau de livraison valide pour « ${categorie} ».`,

    // Adresse
    adresseVide: "Adresse vide.",
    adresseIntrouvable: "Adresse introuvable. Vérifiez l'adresse saisie.",
    horsZone: (distance: number, rayon: number) =>
      `Cette adresse est à ${distance} km — hors de la zone de livraison (${rayon} km max).`,

    // Compte
    identifiantsRequis: "Email et mot de passe requis.",
    identifiantsIncorrects: "Email ou mot de passe incorrect.",
    emailDejaUtilise: "Cet email est déjà utilisé.",

    // Contact
    nomTelephoneRequis: "Nom et téléphone requis.",
  },
}

export type Dictionnaire = typeof fr
export default fr
