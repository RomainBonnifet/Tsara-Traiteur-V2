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
        orderBy: { position: "asc" },
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

  // Une catégorie masquée n'est pas seulement absente de la liste : ses
  // formules ne doivent pas non plus être atteignables par une URL devinée
  // ou un ancien lien partagé. On répond 404 comme pour une formule
  // inexistante — ne pas révéler qu'elle existe est ici un bonus.
  if (!formule || !formule.categorie.visiblePublic) {
    return NextResponse.json({ error: 'Formule introuvable' }, { status: 404 })
  }

  return NextResponse.json(formule)
}
