import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/stats
// Agrège les chiffres clés pour le dashboard : total commandes, CA, statuts
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  // On récupère toutes les commandes en une seule requête
  // puis on calcule les stats en JS pour éviter plusieurs aller-retours DB
  const commandes = await prisma.order.findMany({
    select: { statut: true, montantTotal: true },
  })

  const totalCommandes = commandes.length
  const chiffreAffaires = commandes
    .filter((c) => c.statut === "payee")
    .reduce((sum, c) => sum + c.montantTotal, 0)
  const commandesEnAttente = commandes.filter(
    (c) => c.statut === "en_attente"
  ).length
  const commandesPayees = commandes.filter((c) => c.statut === "payee").length

  return NextResponse.json({
    totalCommandes,
    chiffreAffaires,
    commandesEnAttente,
    commandesPayees,
  })
}
