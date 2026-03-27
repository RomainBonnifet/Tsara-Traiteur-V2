import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/articles
// Retourne tous les articles avec leur statut de disponibilité
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const articles = await prisma.article.findMany({
    orderBy: { id: "asc" },
  })

  return NextResponse.json(articles)
}

// POST /api/admin/articles
// Crée un nouvel article : { nom, description }
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { nom, description, image } = body

  if (!nom) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
  }

  const article = await prisma.article.create({
    data: {
      nom,
      description: description || null,
      image: image || null,
      disponible: true,
    },
  })

  return NextResponse.json(article, { status: 201 })
}
