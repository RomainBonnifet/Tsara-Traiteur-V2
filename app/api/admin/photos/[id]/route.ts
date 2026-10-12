import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// PATCH — déplace la photo d'un cran vers le haut ou vers le bas.
// Body : { direction: "up" | "down" }
//
// On ne permute pas deux positions : on relit la liste telle qu'elle est
// AFFICHÉE, on échange deux éléments du tableau, puis on renumérote tout
// de 0 à n-1.
//
// La permutation supposait des positions uniques et contiguës. Sur les
// créneaux de formule, deux positions égales faisaient descendre un
// élément de deux lignes d'un coup. Ici l'algorithme ne suppose rien :
// chaque déplacement répare au passage les doublons et les trous.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { direction } = await req.json()
  const photoId = Number(params.id)

  const photos = await prisma.photo.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { id: true },
  })

  const index = photos.findIndex((p) => p.id === photoId)
  const cible = direction === "up" ? index - 1 : index + 1

  // Déjà en haut ou déjà en bas : ce n'est pas une erreur, il n'y a
  // simplement rien à faire.
  if (index === -1 || cible < 0 || cible >= photos.length) {
    return NextResponse.json({ ok: true })
  }

  const ordre = [...photos]
  ordre[index] = photos[cible]
  ordre[cible] = photos[index]

  // Une seule transaction : une renumérotation à moitié écrite
  // laisserait la galerie dans un état pire que celui qu'on corrige.
  await prisma.$transaction(
    ordre.map((p, i) => prisma.photo.update({ where: { id: p.id }, data: { position: i } }))
  )

  return NextResponse.json({ ok: true })
}

// DELETE — supprime la photo sur Cloudinary ET en base
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const photo = await prisma.photo.findUnique({ where: { id: Number(params.id) } })
  if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })

  // Supprime sur Cloudinary si on a le publicId
  if (photo.publicId) {
    await cloudinary.uploader.destroy(photo.publicId)
  }

  await prisma.photo.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
