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
  "Pour 3 personnes": "For 3 people",

  // ── Créneaux (Slot.nom) ──
  "Baguette, confiture du moment & beurre": "Baguette, seasonal jam & butter",
  "Boissons chaudes": "Hot drinks",
  "Mignardise": "Petit four",
  "Viennoiseries artisanales": "Artisan pastries",

  // ── Articles ──
  "Abatilles plate et gazeuse": "Abatilles still and sparkling water",
  "Assortiment de viennoiseries": "Assorted pastries",
  "Beurre doux": "Unsalted butter",
  "Beurre salé": "Salted butter",
  "Café": "Coffee",
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
  "Mini croissant": "Mini croissant",
  "Mini pain au chocolat": "Mini pain au chocolat",
  "Mini pain aux raisins": "Mini raisin swirl",
  "Mixte": "Mixed",
  "Moitié charcuterie, moitié fromage": "Half charcuterie, half cheese",
  "Pain au chocolat": "Pain au chocolat",
  "Pain individuel et confiture du moment": "Individual bread roll and seasonal jam",
  "Plateau de charcuteries": "Charcuterie platter",
  "Plateau de fromages": "Cheese platter",
  "Plateau de fruits découpés": "Sliced fruit platter",
  "Plateau de fruits frais": "Fresh fruit platter",
  "Plateau mixte": "Mixed platter",
  "Riz au lait": "Rice pudding",
  "Tartinable": "Savoury spread",
  "Terrine de campagne": "Country pâté",
  "Thé noir": "Black tea",
  "Thés": "Teas",
  "Yaourt aux fruits": "Fruit yoghurt",
  "Yaourt nature": "Plain yoghurt",
  "Yaourt nature et fruits": "Plain yoghurt and fruit",
  "Sélection de charcuteries de nos producteurs": "A selection of charcuterie from our producers",
  "Sélection de fromages affinés": "A selection of matured cheeses",

  // ── Extras ──
  "Baguette céréales": "Multigrain baguette",
  "Jus de poire 1L": "Pear juice, 1L",
  "Jus de pomme 1L": "Apple juice, 1L",
  "Pot de fromage blanc 430ml": "Tub of fromage blanc, 430ml",
  "Pot de riz au lait 430ml": "Tub of rice pudding, 430ml",
  "Sachet chocolat": "Sachet of drinking chocolate",

  // ── Contenu present en production mais absent de la base de travail ──
  // Le traiteur modifie son catalogue en ligne : ces chaines ont ete
  // relevees par prisma/verifie-traductions.mjs lance sur la production.
  // Formules de groupe : masquees du site public, mais leurs noms
  // apparaissent encore dans le dashboard et dans les emails des commandes
  // deja passees.

  // ── Catalogue refondu par le traiteur (octobre 2026) ──
  // Descriptions de formules
  "Une sélection locale et artisanale à partager": "A local, artisan selection to share",
  "Commander au plus tard à 18h pour une livraison le lendemain matin.":
    "Order by 6pm for delivery the next morning.",
  "Commander au plus tard à 20h pour une livraison le lendemain matin.":
    "Order by 8pm for delivery the next morning.",

  // Créneaux
  "Baguette, confiture maison & beurre": "Baguette, homemade jam & butter",
  "Jus de fruits artisanal 1L": "Artisan fruit juice, 1L",
  "Pain tranché aux céréales, gressins et toasts grillés":
    "Sliced multigrain bread, breadsticks and toasts",
  "Planche au choix": "Board of your choice",
  // « Saucisson ou fuet » sert à la fois de nom de créneau et de nom
  // d'article : une seule entrée couvre les deux.
  "Saucisson ou fuet": "Cured sausage or fuet",
  "Yaourts fermiers": "Farmhouse yoghurts",

  // Articles et descriptions
  "Café moulu": "Ground coffee",
  "Pain tranché aux céréales": "Sliced multigrain bread",
  "Café bio": "Organic coffee",
  "Chocolatine": "Pain au chocolat",
  "Pur beurre": "All butter",
  "Etui de 6 canelés Lunch Toque cuivrée": "Box of 6 Lunch canelés from Toque Cuivrée",

  // ── Créneaux de livraison (Categorie.creneaux) ──
  "7h30 – 8h30": "7.30am – 8.30am",
  "8h30 – 9h30": "8.30am – 9.30am",
  "9h30 – 10h30": "9.30am – 10.30am",
  "10h30 – 11h30": "10.30am – 11.30am",
  "Entre 18h et 20h": "Between 6pm and 8pm",
  "Après 20h": "After 8pm",
}

// Chaînes qui restent en français DANS TOUTES LES LANGUES.
//
// Noms de fermes, d'artisans et de produits de marque : les traduire
// serait une faute, pas un service. « Ferme Bodard » ne devient pas
// « Bodard Farm » — c'est le nom de l'entreprise, et c'est ce que le
// client anglophone verra sur l'étiquette à la livraison.
//
// Cette liste existe pour que le script de vérification ne les réclame
// pas indéfiniment. Sans elle, ce bruit permanent finirait par masquer un
// vrai oubli de traduction.
const NOMS_PROPRES = [
  "Ferme Bodard",
  "Ferme Laclavette",
  "Ferme de Rivaud",
  "La Toque Cuivrée",
  "Le Temps des Saisons",
  "Source des Abatilles",
  "Canelé Lunch",
]

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
  en: new Map([
    ...Object.entries(EN).map(([fr, en]) => [normaliser(fr), en] as [string, string]),
    // Les noms propres s'indexent sur eux-mêmes. Les faire passer par la
    // même table plutôt que par un test à part garde traduireContenu() à
    // une seule branche : on cherche, on trouve ou on garde l'original.
    ...NOMS_PROPRES.map((n) => [normaliser(n), n] as [string, string]),
  ]),
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
