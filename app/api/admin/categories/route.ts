import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// GET /api/admin/categories
// Retourne TOUTES les catégories, y compris celles que /api/formules
// masque parce qu'elles ne contiennent aucune formule. Le dashboard s'en
// sert pour peupler les menus déroulants : sans cette route dédiée, l'admin
// ne pourrait pas créer la première formule d'une catégorie encore vide,
// ni y rattacher un extra.
export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const categories = await prisma.categorie.findMany({
    orderBy: { id: "asc" },
    select: { id: true, nom: true },
  })

  return NextResponse.json(categories)
}
