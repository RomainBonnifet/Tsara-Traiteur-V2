// Traduction du CONTENU de la base.
//
// Les dictionnaires fr.ts / en.ts traduisent ce qui est écrit dans le code.
// Mais les noms de formules, de créneaux, d'articles et d'extras viennent de
// PostgreSQL : aucune clé de traduction ne peut les atteindre.
//
// ── Pourquoi un glossaire plutôt que des colonnes « nomEn » en base ──
//
// Des colonnes de traduction seraient plus robustes (un renommage ne pourrait
// pas casser le lien), mais elles supposent que quelqu'un les remplisse. Le
// traiteur est français : des champs « nom anglais » resteraient vides, et le
// site retomberait sur le français de toute façon. Ce glossaire est maintenu
// par le développeur, ce qui correspond à la réalité du projet.
//
// ── Le défaut à connaître ──
//
// C'est une source de vérité PARALLÈLE. Si le traiteur renomme « Boissons
// chaudes » en « Boissons », l'entrée ne correspond plus et l'anglais
// redevient français SANS AVERTISSEMENT.
//
// C'est pour neutraliser exactement ce risque qu'existe le script
// prisma/verifie-traductions.mjs : il compare ce glossaire au contenu réel de
// la base et liste ce qui n'est pas traduit. Lance-le après chaque
// modification du catalogue.

import type { Langue } from "./config"

// Clé = la chaîne française EXACTE telle qu'elle est en base.
// Les accents et la casse comptent — la comparaison est normalisée par
// traduireContenu(), mais mieux vaut recopier la valeur réelle.
const EN: Record<string, string> = {
  // Les NOMS de formules ne sont pas traduits : « Découverte »,
  // « Conviviale », « Festive » sont des noms commerciaux, au même titre que
  // « Tsara ». Les traduire n aiderait pas a la comprehension et ferait
  // perdre leur identite. Leurs DESCRIPTIONS, en revanche, portent une
  // information utile et sont traduites ci-dessous.

  // ── Descriptions de formules ──
  "à commander avant 18h la veille de la livraison": "to be ordered before 6pm the day before delivery",
  "À PARTIR DE 4 PERSONNES, COMMANDE 24H AVANT": "FROM 4 PEOPLE, ORDER 24H IN ADVANCE",
  "Pour 2 à 4 personnes": "For 2 to 4 people",
  "Pour 6 à 8 personnes": "For 6 to 8 people",
  "Pour 10 à 12 personnes": "For 10 to 12 people",
  "Pour 3 personnes": "For 3 people",

  // ── Créneaux (Slot.nom) ──
  "Baguette, confiture du moment & beurre": "Baguette, seasonal jam & butter",
  "Boissons chaudes": "Hot drinks",
  "Desserts fermiers": "Farmhouse desserts",
  "Jus de fruits 1L": "Fruit juice, 1L",
  "Mignardise": "Petit four",
  "Planche format classique": "Sharing board, classic size",
  "Planche format généreux": "Sharing board, generous size",
  "Viennoiseries artisanales": "Artisan pastries",

  // ── Articles ──
  "Abatilles plate et gazeuse": "Abatilles still and sparkling water",
  "Assortiment de viennoiseries": "Assorted pastries",
  "Beurre doux": "Unsalted butter",
  "Beurre salé": "Salted butter",
  "Café": "Coffee",
  "Café en stick": "Instant coffee stick",
  "Café, thés et chocolat chaud": "Coffee, teas and hot chocolate",
  "Charcuterie": "Charcuterie",
  "Chips artisanales": "Artisan crisps",
  "Chocolat chaud": "Hot chocolate",
  "Corbeille de fruits entiers": "Basket of whole fruit",
  "Croissant": "Croissant",
  "Crème dessert café": "Coffee dessert cream",
  "Crème dessert chocolat": "Chocolate dessert cream",
  "Eau plate": "Still water",
  "Eau pétillante": "Sparkling water",
  "Fromage": "Cheese",
  "Fromage blanc": "Fromage blanc",
  "Jus artisanale du moment": "Seasonal artisan juice",
  "Jus de poire": "Pear juice",
  "Jus de pomme": "Apple juice",
  "Lait frais fermier": "Fresh farm milk",
  "Lait fermier": "Farm milk",
  "Mini canelé": "Mini canelé",
  "Mini croissant": "Mini croissant",
  "Mini pain au chocolat": "Mini pain au chocolat",
  "Mini pain aux raisins": "Mini raisin swirl",
  "Mixte": "Mixed",
  "Moitié charcuterie, moitié fromage": "Half charcuterie, half cheese",
  "Pain au chocolat": "Pain au chocolat",
  "Pain individuel et confiture du moment": "Individual bread roll and seasonal jam",
  "Pain tranché": "Sliced bread",
  "Plateau de charcuteries": "Charcuterie platter",
  "Plateau de fromages": "Cheese platter",
  "Plateau de fruits découpés": "Sliced fruit platter",
  "Plateau de fruits frais": "Fresh fruit platter",
  "Plateau mixte": "Mixed platter",
  "Riz au lait": "Rice pudding",
  "Saucisson nature": "Plain cured sausage",
  "Saucisson": "Cured sausage",
  "Tartinable": "Savoury spread",
  "Terrine de campagne": "Country pâté",
  "Thé blanc": "White tea",
  "Thé noir": "Black tea",
  "Thé vert": "Green tea",
  "Thés": "Teas",
  "Yaourt aux fruits": "Fruit yoghurt",
  "Yaourt nature": "Plain yoghurt",
  "Yaourt nature et fruits": "Plain yoghurt and fruit",
  "Bio": "Organic",
  "Sélection de charcuteries de nos producteurs": "A selection of charcuterie from our producers",
  "Sélection de fromages affinés": "A selection of matured cheeses",
  "pur porc": "pure pork",

  // ── Extras ──
  "Baguette céréales": "Multigrain baguette",
  "Etui de 6 canelés Toque cuivrée": "Box of 6 Toque Cuivrée canelés",
  "Jus de poire 1L": "Pear juice, 1L",
  "Jus de pomme 1L": "Apple juice, 1L",
  "Pot de fromage blanc 430ml": "Tub of fromage blanc, 430ml",
  "Pot de riz au lait 430ml": "Tub of rice pudding, 430ml",
  "Sachet chocolat": "Sachet of drinking chocolate",

  // ── Contenu present en production mais absent de la base de travail ──
  // Le traiteur modifie son catalogue en ligne : ces chaines ont ete
  // relevees par prisma/verifie-traductions.mjs lance sur la production.
  "À PARTIR DE 4 PERSONNES, COMMANDE AVANT 18H POUR UNE LIVRAISON LE LENDEMAIN MATIN":
    "FROM 4 PEOPLE, ORDER BEFORE 6PM FOR DELIVERY THE NEXT MORNING",
  "À PARTIR DE 6 PERSONNES, COMMANDE 48H AVANT": "FROM 6 PEOPLE, ORDER 48H IN ADVANCE",
  "À PARTIR DE 10 PERSONNES, COMMANDE 24H AVANT": "FROM 10 PEOPLE, ORDER 24H IN ADVANCE",
  "À PARTIR DE 10 PERSONNES, COMMANDE 48H AVANT": "FROM 10 PEOPLE, ORDER 48H IN ADVANCE",
  "Plateaux de fromages & charcuteries": "Cheese & charcuterie boards",
  "Plateau fromages & charcuteries": "Cheese & charcuterie board",
  // Formules de groupe : masquees du site public, mais leurs noms
  // apparaissent encore dans le dashboard et dans les emails des commandes
  // deja passees.
  "Boissons chaudes en thermos": "Hot drinks in flasks",
  "Mini viennoiseries artisanales": "Mini artisan pastries",
  "Jus de fruits local": "Local fruit juice",
  "Eaux": "Water",

  // ── Créneaux de livraison (Categorie.creneaux) ──
  "7h30 – 8h30": "7.30am – 8.30am",
  "8h30 – 9h30": "8.30am – 9.30am",
  "9h30 – 10h30": "9.30am – 10.30am",
  "10h30 – 11h30": "10.30am – 11.30am",
  "Entre 18h et 20h": "Between 6pm and 8pm",
  "Après 20h": "After 8pm",
}

const GLOSSAIRES: Record<Langue, Record<string, string>> = { fr: {}, en: EN }

// Index normalisé, construit UNE FOIS au chargement du module et non à chaque
// appel : la page de commande traduit plusieurs dizaines de chaînes par rendu.
//
// La normalisation (espaces réduits, casse ignorée) absorbe les saisies
// approximatives du dashboard : « Boissons  chaudes » avec deux espaces
// trouvera quand même sa traduction.
const normaliser = (texte: string) => texte.replace(/\s+/g, " ").trim().toLowerCase()

const INDEX: Record<Langue, Map<string, string>> = {
  fr: new Map(),
  en: new Map(Object.entries(EN).map(([fr, en]) => [normaliser(fr), en])),
}

/**
 * Traduit une chaîne venue de la base.
 *
 * Renvoie le texte D'ORIGINE quand aucune traduction n'existe. C'est
 * volontaire : mieux vaut un nom de produit en français qu'une clé technique
 * ou un blanc. Le client anglophone comprendra le contexte, et le script de
 * vérification signalera l'oubli au développeur.
 */
export function traduireContenu(texte: string | null | undefined, langue: Langue): string {
  if (!texte) return ""
  if (langue === "fr") return texte
  return INDEX[langue]?.get(normaliser(texte)) ?? texte
}

// Exporté pour le script de vérification, qui a besoin de savoir ce que le
// glossaire couvre sans dupliquer la liste.
export function clesTraduites(langue: Langue) {
  return Object.keys(GLOSSAIRES[langue] ?? {})
}
