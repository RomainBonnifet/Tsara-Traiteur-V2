import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { ID_REGLAGES } from "@/lib/reglages"

// Longueur du mot affiché aux visiteurs. Il tient sur un bandeau : au-delà,
// ce n'est plus une information, c'est un paragraphe que personne ne lira.
const MAX_MESSAGE = 200

// GET /api/admin/reglages
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  // upsert et non findUnique : la ligne est créée par la migration, mais une
  // base restaurée ou créée autrement pourrait ne pas l'avoir. Le dashboard
  // doit fonctionner dans tous les cas plutôt que de renvoyer une erreur que
  // le traiteur ne saurait pas résoudre.
  const reglages = await prisma.reglages.upsert({
    where: { id: ID_REGLAGES },
    update: {},
    create: { id: ID_REGLAGES },
    select: { commandesOuvertes: true, messagePause: true, updatedAt: true },
  })

  return NextResponse.json(reglages)
}

// PUT /api/admin/reglages
// { commandesOuvertes?: boolean, messagePause?: string | null }
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { commandesOuvertes, messagePause } = await req.json()

  // Chaîne vide ramenée à null : la base distingue ainsi « aucun message »
  // de « un message vide », et le bandeau n'affiche pas une ligne blanche.
  const message =
    messagePause === undefined
      ? undefined
      : typeof messagePause === "string" && messagePause.trim() !== ""
        ? messagePause.trim().slice(0, MAX_MESSAGE)
        : null

  const reglages = await prisma.reglages.upsert({
    where: { id: ID_REGLAGES },
    update: {
      ...(commandesOuvertes !== undefined && { commandesOuvertes: Boolean(commandesOuvertes) }),
      ...(message !== undefined && { messagePause: message }),
    },
    create: {
      id: ID_REGLAGES,
      commandesOuvertes: commandesOuvertes === undefined ? true : Boolean(commandesOuvertes),
      messagePause: message ?? null,
    },
    select: { commandesOuvertes: true, messagePause: true, updatedAt: true },
  })

  return NextResponse.json(reglages)
}
