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

  const slot = await prisma.slot.create({
    data: {
      nom,
      formuleId: parseInt(id),
    },
    include: {
      articles: { include: { article: true } },
    },
  })

  return NextResponse.json(slot, { status: 201 })
}
