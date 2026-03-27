import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/commandes/[id]
// Retourne le détail complet d'une commande
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const commande = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: { select: { id: true, email: true } },
      formule: { select: { id: true, nom: true, prix: true } },
      items: {
        include: {
          slot: { select: { id: true, nom: true } },
          article: { select: { id: true, nom: true } },
        },
      },
      extras: {
        include: {
          extra: { select: { id: true, nom: true, prix: true } },
        },
      },
    },
  })

  if (!commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
  }

  return NextResponse.json(commande)
}

// PATCH /api/admin/commandes/[id]
// Permet de modifier le statut d'une commande : { statut: "payee" | "annulee" | "en_attente" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { statut } = body

  const statutsValides = ["en_attente", "payee", "annulee"]
  if (!statut || !statutsValides.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
  }

  const commande = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { statut },
  })

  return NextResponse.json(commande)
}
