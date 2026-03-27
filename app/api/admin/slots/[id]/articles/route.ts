import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// POST /api/admin/slots/[id]/articles
// Ajoute un article à un slot (crée une entrée SlotArticle)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { articleId } = body

  if (!articleId) {
    return NextResponse.json({ error: "articleId est requis" }, { status: 400 })
  }

  const slotArticle = await prisma.slotArticle.create({
    data: {
      slotId: parseInt(id),
      articleId: parseInt(articleId),
    },
  })

  return NextResponse.json(slotArticle, { status: 201 })
}
