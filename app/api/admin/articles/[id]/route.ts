import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// PUT /api/admin/articles/[id]
// Modifie un article : { nom, description, disponible }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom, description, image, disponible } = body

  const article = await prisma.article.update({
    where: { id: parseInt(id) },
    data: {
      ...(nom !== undefined && { nom }),
      ...(description !== undefined && { description }),
      ...(image !== undefined && { image: image || null }),
      ...(disponible !== undefined && { disponible: Boolean(disponible) }),
    },
  })

  return NextResponse.json(article)
}

// DELETE /api/admin/articles/[id]
// Supprime un article
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  await prisma.orderItem.deleteMany({ where: { articleId: parseInt(id) } })
  await prisma.slotArticle.deleteMany({ where: { articleId: parseInt(id) } })
  await prisma.article.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ success: true })
}
