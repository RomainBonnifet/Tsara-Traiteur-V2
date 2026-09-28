import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await prisma.categorie.findMany({
    // On excluait ici la catégorie "Groupe" par son nom ; elle a été
    // supprimée (buffets vendus uniquement sur devis). Le filtre est
    // remplacé par une règle structurelle plutôt que par un autre nom en
    // dur : une catégorie sans aucune formule n'a rien à montrer, et
    // afficherait un titre de section suivi d'une grille vide.
    where: { formules: { some: {} } },
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
