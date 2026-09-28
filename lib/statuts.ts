// Source unique des statuts de commande, des modes de paiement et de leurs
// libellés. Le dashboard, les routes API et les statistiques s'y réfèrent :
// ajouter un statut ici suffit à le rendre disponible partout.

export const STATUTS_COMMANDE = ["en_attente", "a_regler", "payee", "annulee"] as const
export type StatutCommande = (typeof STATUTS_COMMANDE)[number]

const LIBELLES_STATUT: Record<StatutCommande, string> = {
  en_attente: "En attente",
  a_regler: "À régler",
  payee: "Payée",
  annulee: "Annulée",
}

export const MODES_PAIEMENT = ["en_ligne", "livraison"] as const
export type ModePaiement = (typeof MODES_PAIEMENT)[number]

const LIBELLES_MODE_PAIEMENT: Record<ModePaiement, string> = {
  en_ligne: "En ligne (carte bancaire)",
  livraison: "À la livraison (carte ou espèces)",
}

// Libellés lisibles pour une valeur venue de la base. Une valeur inattendue
// est affichée telle quelle plutôt que de faire planter l'affichage.
export function libelleStatut(statut: string) {
  return LIBELLES_STATUT[statut as StatutCommande] ?? statut
}

export function libelleModePaiement(mode: string) {
  return LIBELLES_MODE_PAIEMENT[mode as ModePaiement] ?? mode
}

// Gardes de type : après `if (estStatutValide(x))`, TypeScript sait que x
// est l'une des valeurs autorisées, et plus seulement « quelque chose ».
export function estStatutValide(valeur: unknown): valeur is StatutCommande {
  return typeof valeur === "string" && (STATUTS_COMMANDE as readonly string[]).includes(valeur)
}

export function estModePaiementValide(valeur: unknown): valeur is ModePaiement {
  return typeof valeur === "string" && (MODES_PAIEMENT as readonly string[]).includes(valeur)
}
