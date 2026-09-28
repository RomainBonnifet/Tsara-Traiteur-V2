import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/extras?categorieId=3
//
// Sans paramètre : tous les extras disponibles (comportement d'origine).
// Avec un categorieId : ceux de cette catégorie, PLUS ceux qui n'en ont
// aucune. Un extra sans catégorie est volontairement universel — une
// baguette ou un sachet de chocolat se propose aussi bien avec un
// petit-déjeuner qu'avec un plateau apéro.
//
// Le filtre est appliqué ici et non dans le navigateur : la règle n'existe
// qu'à un seul endroit, et la page ne reçoit que ce qu'elle doit afficher.
export async function GET(req: NextRequest) {
  const brut = req.nextUrl.searchParams.get('categorieId')

  // Number() sur une chaîne non numérique donne NaN, pas une erreur : sans
  // ce contrôle, "?categorieId=abc" produirait une requête Prisma invalide.
  const categorieId = brut === null ? null : Number(brut)
  if (categorieId !== null && !Number.isInteger(categorieId)) {
    return NextResponse.json({ error: 'categorieId invalide' }, { status: 400 })
  }

  const extras = await prisma.extra.findMany({
    where: {
      disponible: true,
      ...(categorieId !== null && {
        OR: [{ categorieId }, { categorieId: null }],
      }),
    },
    orderBy: { id: 'asc' },
  })

  return NextResponse.json(extras)
}
