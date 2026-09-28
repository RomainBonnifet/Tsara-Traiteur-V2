// Unité de vente d'une formule.
//
// Un petit-déjeuner se facture au couvert ("personne"), une formule apéritive
// se facture à la pièce ("formule"). Le calcul est le même dans les deux cas
// — prix × quantité — seul le vocabulaire affiché change. Plutôt que de
// deviner l'unité d'après le nom de la catégorie (fragile : le traiteur
// renomme ses catégories quand il veut), chaque formule porte la sienne,
// réglable dans le dashboard.

import { LANGUE_DEFAUT, type Langue } from "./i18n/config"

export const UNITES_FORMULE = ["personne", "formule"] as const
export type UniteFormule = (typeof UNITES_FORMULE)[number]

type LibellesUnite = { singulier: string; pluriel: string; court: string; contenant: string }

// Ces mots sont affichés au client : ils se traduisent, comme le reste.
// Ils ne vivent pas dans lib/i18n/fr.ts parce qu'ils dépendent de l'unité
// de vente, une donnée de la base — les garder ici évite un aller-retour
// entre deux fichiers pour comprendre ce qui s'affiche.
const LIBELLES: Record<Langue, Record<UniteFormule, LibellesUnite>> = {
  fr: {
    personne: { singulier: "personne", pluriel: "personnes", court: "pers.", contenant: "Panier" },
    formule: { singulier: "formule", pluriel: "formules", court: "formule", contenant: "Formule" },
  },
  en: {
    personne: { singulier: "person", pluriel: "people", court: "person", contenant: "Basket" },
    formule: { singulier: "offer", pluriel: "offers", court: "offer", contenant: "Offer" },
  },
}

// « plateau » était l'ancien nom de l'unité « formule ». Une migration le
// convertit en base, mais cet alias garde le site correct si un
// environnement n'a pas encore été migré : sans lui, ces formules
// retomberaient silencieusement sur « personne » et afficheraient
// « 149,90 € / pers. » au lieu de « / formule ».
const ALIAS_HERITES: Record<string, UniteFormule> = { plateau: "formule" }

// Une valeur inattendue venue de la base retombe sur "personne" plutôt que
// de faire planter l'affichage.
//
// La langue est optionnelle et vaut « fr » par défaut : le dashboard, les
// emails et la description envoyée à Stripe restent en français sans avoir à
// passer d'argument. Seules les pages publiques transmettent la langue.
function libelles(unite: string, langue: Langue = LANGUE_DEFAUT) {
  const cle = ALIAS_HERITES[unite] ?? unite
  const table = LIBELLES[langue] ?? LIBELLES[LANGUE_DEFAUT]
  return table[cle as UniteFormule] ?? table.personne
}

// Accord en nombre : « 1 personne », « 4 personnes », « 2 formules »
export function libelleUnite(unite: string, nombre: number, langue?: Langue) {
  const l = libelles(unite, langue)
  return nombre > 1 ? l.pluriel : l.singulier
}

// Forme courte pour les prix : « 12 € / pers. », « 35 € / formule »
export function uniteCourte(unite: string, langue?: Langue) {
  return libelles(unite, langue).court
}

// Mention sous le prix des cartes : « par personne », « par formule »
// « par personne » / « per person ». Le mot de liaison diffère selon la
// langue : il ne peut pas être concaténé en dur.
const PAR: Record<Langue, string> = { fr: "par", en: "per" }

export function parUnite(unite: string, langue: Langue = LANGUE_DEFAUT) {
  return `${PAR[langue] ?? PAR.fr} ${libelles(unite, langue).singulier}`
}

// Intitulé d'un onglet de composition : « Panier 1 », « Formule 2 »
export function libelleContenant(unite: string, langue?: Langue) {
  return libelles(unite, langue).contenant
}

export function estUniteValide(valeur: unknown): valeur is UniteFormule {
  return typeof valeur === "string" && (UNITES_FORMULE as readonly string[]).includes(valeur)
}

// Nombre d'unités qu'un créneau réclame pour une commande donnée.
//
// Deux réglages indépendants, et c'est volontaire :
//   capacite         = combien de PERSONNES une unité sert  (diviseur)
//   quantiteParUnite = combien d'EXEMPLAIRES par unité      (multiplicateur)
//
// L'arrondi se fait AVANT la multiplication. Pour « 2 bouteilles pour
// 4 personnes » avec 5 convives : ceil(5/4) × 2 = 4 bouteilles. Multiplier
// d'abord donnerait ceil(10/4) = 3, et le cinquième convive n'aurait rien.
//
// Les || 1 protègent d'un 0 ou d'un NULL en base, qui donneraient
// respectivement Infinity et une cible nulle.
export function cibleSlot(nbUnites: number, capacite: number, quantiteParUnite: number) {
  return Math.ceil(nbUnites / Math.max(1, capacite || 1)) * Math.max(1, quantiteParUnite || 1)
}
