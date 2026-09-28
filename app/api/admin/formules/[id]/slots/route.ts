import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// POST /api/admin/formules/[id]/slots
// Crée un nouveau slot pour une formule donnée
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom } = body

  if (!nom) {
    return NextResponse.json({ error: "Le nom du slot est requis" }, { status: 400 })
  }

  const formuleId = parseInt(id)

  // Sans position explicite, Prisma applique le @default(0) du schéma : tout
  // nouveau créneau naissait donc à égalité avec le premier de la liste.
  // Deux créneaux partageant une position cassent le réordonnancement, qui
  // compare des positions strictement inférieures ou supérieures.
  // _max donne la plus grande position existante ; null si la formule n'a
  // encore aucun créneau, auquel cas le premier prend 0.
  const { _max } = await prisma.slot.aggregate({
    where: { formuleId },
    _max: { position: true },
  })
  const position = _max.position === null ? 0 : _max.position + 1

  const slot = await prisma.slot.create({
    data: {
      nom,
      formuleId,
      position,
    },
    include: {
      articles: { include: { article: true } },
    },
  })

  return NextResponse.json(slot, { status: 201 })
}
