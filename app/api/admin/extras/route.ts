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
  })

  return NextResponse.json(extras)
}

// POST /api/admin/extras
// Crée un nouvel extra : { nom, prix }
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { nom, prix, description, image } = body

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
      disponible: true,
    },
  })

  return NextResponse.json(extra, { status: 201 })
}
