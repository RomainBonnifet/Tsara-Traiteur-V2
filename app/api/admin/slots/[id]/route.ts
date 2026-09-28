import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// PUT /api/admin/slots/[id]
// Renomme un slot existant
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const { nom, capacite, quantiteParUnite } = body

  if (!nom) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
  }

  const slot = await prisma.slot.update({
    where: { id: parseInt(id) },
    data: {
      nom,
      // Math.max(1, ...) : le champ du dashboard a bien min="1", mais rien
      // n'oblige à passer par lui pour appeler cette API. Une capacité à 0
      // provoquerait une division par zéro, une quantité à 0 rendrait le
      // créneau impossible à satisfaire.
      ...(capacite !== undefined && { capacite: Math.max(1, parseInt(capacite) || 1) }),
      ...(quantiteParUnite !== undefined && {
        quantiteParUnite: Math.max(1, parseInt(quantiteParUnite) || 1),
      }),
    },
    include: {
      articles: { include: { article: true } },
    },
  })

  return NextResponse.json(slot)
}

// PATCH /api/admin/slots/[id]
// Déplace le slot vers le haut ou vers le bas dans sa formule
// Body : { direction: "up" | "down" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { direction } = await req.json()

  const slotId = parseInt(id)
  const slot = await prisma.slot.findUnique({ where: { id: slotId } })
  if (!slot) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  // L'ancienne version échangeait la position du créneau avec celle de son
  // voisin le plus proche, trouvé par « position strictement inférieure /
  // supérieure ». Elle supposait donc des positions UNIQUES et CONTIGUËS.
  // Dès que deux créneaux partageaient une position, le « strictement
  // supérieur » les sautait tous les deux : descendre faisait franchir deux
  // lignes d'un coup.
  //
  // On raisonne désormais sur l'ordre AFFICHÉ, pas sur les valeurs : on lit
  // la liste triée comme le dashboard la lit, on permute deux éléments du
  // tableau, puis on renumérote TOUT de 0 à n-1. Conséquence utile : chaque
  // déplacement répare au passage les positions en doublon ou à trous.
  const freres = await prisma.slot.findMany({
    where: { formuleId: slot.formuleId },
    // Le tri par id départage les ex aequo. Sans lui, PostgreSQL ne garantit
    // aucun ordre entre deux positions égales, et le serveur pourrait
    // déplacer par rapport à un ordre différent de celui affiché.
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { id: true },
  })

  const index = freres.findIndex((s) => s.id === slotId)
  const cible = direction === "up" ? index - 1 : index + 1

  // Déjà en haut ou déjà en bas : rien à faire, ce n'est pas une erreur.
  if (index === -1 || cible < 0 || cible >= freres.length) {
    return NextResponse.json({ ok: true })
  }

  const ordre = [...freres]
  ordre[index] = freres[cible]
  ordre[cible] = freres[index]

  // Une seule transaction : un renumérotage à moitié écrit laisserait la
  // formule dans un état pire que celui qu'on répare.
  await prisma.$transaction(
    ordre.map((s, i) => prisma.slot.update({ where: { id: s.id }, data: { position: i } }))
  )

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/slots/[id]
// Supprime un slot et toutes ses SlotArticle associées
// On doit d'abord supprimer les SlotArticle car elles dépendent du slot (clé étrangère)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const slotId = parseInt(id)

  // 1. Supprimer les OrderItems qui référencent ce slot
  await prisma.orderItem.deleteMany({ where: { slotId } })

  // 2. Supprimer les SlotArticle liées
  await prisma.slotArticle.deleteMany({ where: { slotId } })

  // 3. Supprimer le slot
  await prisma.slot.delete({ where: { id: slotId } })

  return NextResponse.json({ success: true })
}
