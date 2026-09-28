import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await prisma.categorie.findMany({
    // Deux conditions, pour deux raisons distinctes :
    //
    // visiblePublic : décision commerciale, portée par la DONNÉE. Les buffets
    //   de groupe se vendent sur devis, leur catégorie est donc masquée —
    //   sans nom de catégorie codé en dur dans cette route.
    //
    // formules: some : une catégorie vide n'a rien à montrer, et afficherait
    //   un titre de section suivi d'une grille vide.
    where: { visiblePublic: true, formules: { some: {} } },
    // Ordre explicite : sans orderBy, PostgreSQL ne garantit aucun ordre,
    // et les onglets de la page d'accueil pourraient s'inverser.
    orderBy: { id: "asc" },
    include: {
      formules: {
        orderBy: { position: "asc" },
        include: {
          // Le nom des créneaux et leur quantité : les cartes de l'accueil
          // affichent « Saucisson × 3 », ce qui est précisément la différence
          // entre un petit et un grand plateau. Le détail des articles reste
          // servi par /api/formules/[id], sur la page de commande.
          slots: {
            orderBy: { position: "asc" },
            select: {
              id: true, nom: true, quantiteParUnite: true,
              // Les garnitures d'un créneau à choix : la carte annonce
              // « au choix : charcuterie, fromage ou mixte ». On filtre sur
              // les articles disponibles, sinon un produit en rupture serait
              // encore promis sur la page d'accueil.
              articles: {
                where: { article: { disponible: true } },
                select: { article: { select: { nom: true } } },
              },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(categories)
}
