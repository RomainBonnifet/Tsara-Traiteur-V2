import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// PUT /api/admin/slots/[id]
// Renomme un slot existant
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom } = body

  if (!nom) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
  }

  const slot = await prisma.slot.update({
    where: { id: parseInt(id) },
    data: { nom },
    include: {
      articles: { include: { article: true } },
    },
  })

  return NextResponse.json(slot)
}

// DELETE /api/admin/slots/[id]
// Supprime un slot et toutes ses SlotArticle associées
// On doit d'abord supprimer les SlotArticle car elles dépendent du slot (clé étrangère)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const slotId = parseInt(id)

  // 1. Supprimer les OrderItems qui référencent ce slot
  await prisma.orderItem.deleteMany({ where: { slotId } })

  // 2. Supprimer les SlotArticle liées
  await prisma.slotArticle.deleteMany({ where: { slotId } })

  // 3. Supprimer le slot
  await prisma.slot.delete({ where: { id: slotId } })

  return NextResponse.json({ success: true })
}
