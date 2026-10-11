import { prisma } from "@/lib/prisma"

// Réglages du site.
//
// Une seule ligne en base, d'identifiant 1. Cette contrainte n'est pas portée
// par le schéma (Prisma ne modélise pas les CHECK) mais par ce module : c'est
// le seul endroit qui lit et écrit la table, l'invariant y tient donc.

export type Reglages = {
  commandesOuvertes: boolean
  messagePause: string | null
}

// Valeurs appliquées quand la ligne n'existe pas encore — sur une base créée
// hors migration, par exemple.
//
// Le repli est « ouvert », et c'est un choix. Fermer par défaut couperait la
// vente sur une anomalie technique, en silence, sans que personne l'ait
// décidé. Une ligne absente est un défaut d'installation, pas des congés.
const DEFAUT: Reglages = { commandesOuvertes: true, messagePause: null }

export const ID_REGLAGES = 1

// Volontairement sans try/catch : si la base est injoignable, le site ne
// fonctionne de toute façon pas. Masquer l'erreur ici la ferait apparaître
// plus loin, sous une forme moins compréhensible.
export async function getReglages(): Promise<Reglages> {
  const ligne = await prisma.reglages.findUnique({
    where: { id: ID_REGLAGES },
    select: { commandesOuvertes: true, messagePause: true },
  })
  return ligne ?? DEFAUT
}
