import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/commandes
// Retourne toutes les commandes avec les données associées (user, formule, items, extras)
export async function GET() {
  // Vérifie que l'appelant est admin avant tout
  const auth = await requireAdmin()
  // Si requireAdmin retourne une NextResponse, c'est une erreur → on la renvoie directement
  if (auth instanceof NextResponse) return auth

  const commandes = await prisma.order.findMany({
    orderBy: { date: "desc" },
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

  return NextResponse.json(commandes)
}
