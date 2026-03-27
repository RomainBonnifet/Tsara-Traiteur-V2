import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/formules/[id]
// Retourne la formule complète avec sa catégorie, ses slots et les articles de chaque slot
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const formule = await prisma.formule.findUnique({
    where: { id: parseInt(id) },
    include: {
      categorie: true,
      slots: {
        include: {
          articles: { include: { article: true } },
        },
      },
    },
  })

  if (!formule) {
    return NextResponse.json({ error: "Formule introuvable" }, { status: 404 })
  }

  return NextResponse.json(formule)
}

// PUT /api/admin/formules/[id]
// Modifie le nom, prix et/ou description d'une formule
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom, prix, description } = body

  const formule = await prisma.formule.update({
    where: { id: parseInt(id) },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prix !== undefined && { prix: parseFloat(prix) }),
      ...(description !== undefined && { description }),
    },
    include: { categorie: true },
  })

  return NextResponse.json(formule)
}

// DELETE /api/admin/formules/[id]
// Supprime une formule (attention : la formule ne doit pas avoir de commandes liées)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // On vérifie qu'aucune commande n'est liée à cette formule
  const ordersCount = await prisma.order.count({
    where: { formuleId: parseInt(id) },
  })

  if (ordersCount > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer : des commandes utilisent cette formule" },
      { status: 409 }
    )
  }

  await prisma.formule.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ success: true })
}
