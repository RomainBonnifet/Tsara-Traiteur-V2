import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const formule = await prisma.formule.findUnique({
    where: { id: Number(params.id) },
    include: {
      categorie: true,
      slots: {
        include: {
          articles: {
            where: { article: { disponible: true } },
            include: {
              article: true
            }
          }
        }
      }
    }
  })

  if (!formule) {
    return NextResponse.json({ error: 'Formule introuvable' }, { status: 404 })
  }

  return NextResponse.json(formule)
}
