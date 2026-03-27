import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// PUT /api/admin/extras/[id]
// Modifie un extra : { nom, prix, disponible }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom, prix, description, image, disponible } = body

  const extra = await prisma.extra.update({
    where: { id: parseInt(id) },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prix !== undefined && { prix: parseFloat(prix) }),
      ...(description !== undefined && { description: description || null }),
      ...(image !== undefined && { image: image || null }),
      ...(disponible !== undefined && { disponible: Boolean(disponible) }),
    },
  })

  return NextResponse.json(extra)
}

// DELETE /api/admin/extras/[id]
// Supprime un extra
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Supprimer les OrderExtra liés avant de supprimer l'extra
  await prisma.orderExtra.deleteMany({ where: { extraId: parseInt(id) } })

  await prisma.extra.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ success: true })
}
