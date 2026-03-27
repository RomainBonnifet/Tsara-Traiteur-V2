import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// DELETE /api/admin/slots/[id]/articles/[articleId]
// Retire un article d'un slot en supprimant la SlotArticle correspondante
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; articleId: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id, articleId } = await params

  await prisma.slotArticle.delete({
    where: {
      slotId_articleId: {
        slotId: parseInt(id),
        articleId: parseInt(articleId),
      },
    },
  })

  return NextResponse.json({ success: true })
}
