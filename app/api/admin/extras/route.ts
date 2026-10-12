import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/extras
// Retourne tous les extras
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const extras = await prisma.extra.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
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

  // Position = max + 1 : le nouvel extra arrive EN FIN de liste.
  // Le @default(0) du schéma le placerait à égalité avec le premier, et
  // deux positions identiques rendent le déplacement imprévisible.
  const { _max } = await prisma.extra.aggregate({ _max: { position: true } })
  const position = _max.position === null ? 0 : _max.position + 1

  const extra = await prisma.extra.create({
    data: {
      position,
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
