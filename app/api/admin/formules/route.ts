import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/formules
// Retourne toutes les formules avec leur catégorie
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const formules = await prisma.formule.findMany({
    include: { categorie: true },
    orderBy: [{ categorieId: "asc" }, { position: "asc" }],
  })

  return NextResponse.json(formules)
}

// POST /api/admin/formules
// Crée une nouvelle formule : { nom, prix, description, categorieId }
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { nom, prix, description, categorieId } = body

  if (!nom || prix === undefined || !categorieId) {
    return NextResponse.json(
      { error: "nom, prix et categorieId sont requis" },
      { status: 400 }
    )
  }

  const formule = await prisma.formule.create({
    data: {
      nom,
      prix: parseFloat(prix),
      description: description || null,
      categorieId: parseInt(categorieId),
    },
    include: { categorie: true },
  })

  return NextResponse.json(formule, { status: 201 })
}
