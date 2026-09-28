import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/extras
// Retourne tous les extras
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const extras = await prisma.extra.findMany({
    orderBy: { id: "asc" },
    // La catégorie est jointe pour que le tableau du dashboard affiche son
    // nom sans avoir à faire une requête supplémentaire par ligne.
    include: { categorie: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(extras)
}

// POST /api/admin/extras
// Crée un nouvel extra : { nom, prix }
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { nom, prix, description, image, categorieId } = body

  if (!nom || prix === undefined) {
    return NextResponse.json(
      { error: "nom et prix sont requis" },
      { status: 400 }
    )
  }

  const extra = await prisma.extra.create({
    data: {
      nom,
      prix: parseFloat(prix),
      description: description || null,
      image: image || null,
      // Chaîne vide (le <select> sur « Toutes les formules ») et undefined
      // donnent null : aucune catégorie, donc extra proposé partout.
      categorieId: categorieId ? Number(categorieId) : null,
      disponible: true,
    },
    include: { categorie: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(extra, { status: 201 })
}
