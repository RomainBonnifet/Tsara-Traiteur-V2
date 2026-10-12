import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// PUT /api/admin/extras/[id]
// Modifie un extra : { nom, prix, disponible }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom, prix, description, image, disponible, categorieId } = body

  const extra = await prisma.extra.update({
    where: { id: parseInt(id) },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prix !== undefined && { prix: parseFloat(prix) }),
      ...(description !== undefined && { description: description || null }),
      ...(image !== undefined && { image: image || null }),
      ...(disponible !== undefined && { disponible: Boolean(disponible) }),
      // undefined = champ non envoyé, on n'y touche pas : c'est le cas du
      // bouton Dispo/Indispo, qui n'envoie que « disponible ».
      // "" ou null = l'admin a choisi « Toutes les formules », on efface.
      ...(categorieId !== undefined && {
        categorieId: categorieId ? Number(categorieId) : null,
      }),
    },
    include: { categorie: { select: { id: true, nom: true } } },
  })

  return NextResponse.json(extra)
}

// PATCH /api/admin/extras/[id]
// Déplace l'extra d'un cran. Body : { direction: "up" | "down" }
//
// On relit la liste telle qu'elle est AFFICHÉE, on échange deux éléments
// du tableau, puis on renumérote tout de 0 à n-1. On ne permute pas deux
// positions : cette méthode suppose qu'elles sont uniques et contiguës,
// hypothèse que rien ne garantit. Ici chaque déplacement répare au
// passage les doublons et les trous.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const extraId = parseInt(id)
  const { direction } = await req.json()

  const extras = await prisma.extra.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { id: true },
  })

  const index = extras.findIndex((e) => e.id === extraId)
  const cible = direction === "up" ? index - 1 : index + 1

  // Déjà en haut ou déjà en bas : rien à faire, ce n'est pas une erreur.
  if (index === -1 || cible < 0 || cible >= extras.length) {
    return NextResponse.json({ ok: true })
  }

  const ordre = [...extras]
  ordre[index] = extras[cible]
  ordre[cible] = extras[index]

  // Une seule transaction : une renumérotation à moitié écrite laisserait
  // la liste dans un état pire que celui qu'on corrige.
  await prisma.$transaction(
    ordre.map((e, i) => prisma.extra.update({ where: { id: e.id }, data: { position: i } }))
  )

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/extras/[id]
// Supprime un extra
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Supprimer les OrderExtra liés avant de supprimer l'extra
  await prisma.orderExtra.deleteMany({ where: { extraId: parseInt(id) } })

  await prisma.extra.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ success: true })
}
