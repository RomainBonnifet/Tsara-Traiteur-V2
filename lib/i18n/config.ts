// Configuration des langues du site public.
//
// Le dashboard n'est PAS traduit : le traiteur est français, lui offrir une
// interface anglaise ajouterait du travail de maintenance sans aucun usage.

export const LANGUES = ["fr", "en"] as const
export type Langue = (typeof LANGUES)[number]

export const LANGUE_DEFAUT: Langue = "fr"

// Ce qu'affiche le sélecteur. Le drapeau est un emoji et non une image :
// aucun fichier à charger, et il s'adapte à la taille du texte.
export const LIBELLES_LANGUE: Record<Langue, { nom: string; court: string; drapeau: string }> = {
  fr: { nom: "Français", court: "FR", drapeau: "🇫🇷" },
  en: { nom: "English", court: "EN", drapeau: "🇬🇧" },
}

// Nom du cookie qui retient le choix.
//
// Un cookie plutôt que localStorage : il est envoyé au serveur à chaque
// requête, donc le layout peut rendre la page dans la bonne langue DÈS le
// premier affichage. Avec localStorage, lisible seulement dans le navigateur,
// la page s'afficherait en français puis basculerait en anglais sous les yeux
// du visiteur.
export const COOKIE_LANGUE = "tsara-langue"

export function estLangueValide(valeur: unknown): valeur is Langue {
  return typeof valeur === "string" && (LANGUES as readonly string[]).includes(valeur)
}
