// Créneaux de livraison.
//
// Chaque catégorie porte les siens en base (Categorie.creneaux) : un
// petit-déjeuner se livre le matin, un plateau apéro le soir. Ce module ne
// fournit que le repli et les contrôles, pour que la page panier et
// /api/checkout appliquent exactement les mêmes règles.

// Utilisé quand une catégorie n'a aucun créneau renseigné — typiquement une
// catégorie créée depuis le dashboard. Sans ce repli, ses formules seraient
// impossibles à commander : aucun créneau à choisir, donc formulaire bloqué.
export const CRENEAUX_DEFAUT = [
  "7h30 – 8h30",
  "8h30 – 9h30",
  "9h30 – 10h30",
  "10h30 – 11h30",
]

export function creneauxDe(creneaux: string[] | undefined | null) {
  return creneaux && creneaux.length > 0 ? creneaux : CRENEAUX_DEFAUT
}

// Le navigateur envoie un objet { [categorieId]: "créneau choisi" }. Il vient
// d'un formulaire, donc on n'en croit rien : seul ce contrôle fait foi.
// Le type de retour est une GARDE DE TYPE (« choix is string ») et non un
// simple boolean : apres un appel reussi, TypeScript sait que choix est une
// chaine. Sans cela, l appelant devrait le reaffirmer par un cast, ce qui
// reintroduirait exactement le risque que cette fonction supprime.
export function estCreneauValide(
  choix: unknown,
  creneaux: string[] | undefined | null
): choix is string {
  return typeof choix === "string" && creneauxDe(creneaux).includes(choix)
}
