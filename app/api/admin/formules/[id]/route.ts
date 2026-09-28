import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"
import { estUniteValide } from "@/lib/formule"

// GET /api/admin/formules/[id]
// Retourne la formule complète avec sa catégorie, ses slots et les articles de chaque slot
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const formule = await prisma.formule.findUnique({
    where: { id: parseInt(id) },
    include: {
      categorie: true,
      slots: {
        // Le tri par id départage d'éventuelles positions égales : sans lui,
        // l'ordre affiché pourrait changer d'un chargement à l'autre.
        orderBy: [{ position: "asc" }, { id: "asc" }],
        include: {
          articles: { include: { article: true } },
        },
      },
    },
  })

  if (!formule) {
    return NextResponse.json({ error: "Formule introuvable" }, { status: 404 })
  }

  return NextResponse.json(formule)
}

// PUT /api/admin/formules/[id]
// Modifie les infos d'une formule : nom, prix, description, nombre de
// personnes et mise en avant sur la page d'accueil
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const formuleId = parseInt(id)
  const body = await req.json()
  const { nom, prix, description, minPersonnes, pasPersonnes, miseEnAvant, unite } = body

  // Validation stricte : "false" (texte) est une chaîne non vide, donc
  // « vraie » en JavaScript. Sans ce contrôle, elle mettrait la formule en avant.
  if (miseEnAvant !== undefined && typeof miseEnAvant !== "boolean") {
    return NextResponse.json({ error: "miseEnAvant doit être un booléen" }, { status: 400 })
  }

  if (unite !== undefined && !estUniteValide(unite)) {
    return NextResponse.json({ error: "Unité invalide" }, { status: 400 })
  }

  const data = {
    ...(nom !== undefined && { nom }),
    ...(prix !== undefined && { prix: parseFloat(prix) }),
    ...(description !== undefined && { description }),
    ...(minPersonnes !== undefined && { minPersonnes: parseInt(minPersonnes) }),
    ...(pasPersonnes !== undefined && { pasPersonnes: parseInt(pasPersonnes) }),
    ...(miseEnAvant !== undefined && { miseEnAvant }),
    ...(unite !== undefined && { unite }),
  }

  // Une seule formule « La plus choisie » par catégorie. Mettre celle-ci en
  // avant retire la mise en avant des autres formules de la même catégorie.
  // $transaction garantit que les deux écritures réussissent ensemble ou
  // échouent ensemble : on ne peut pas se retrouver avec deux formules en
  // avant, ni avec aucune, à cause d'une erreur au milieu.
  if (miseEnAvant === true) {
    const actuelle = await prisma.formule.findUnique({
      where: { id: formuleId },
      select: { categorieId: true },
    })
    if (!actuelle) {
      return NextResponse.json({ error: "Formule introuvable" }, { status: 404 })
    }

    const [, formule] = await prisma.$transaction([
      prisma.formule.updateMany({
        where: { categorieId: actuelle.categorieId, id: { not: formuleId } },
        data: { miseEnAvant: false },
      }),
      prisma.formule.update({
        where: { id: formuleId },
        data,
        include: { categorie: true },
      }),
    ])

    return NextResponse.json(formule)
  }

  const formule = await prisma.formule.update({
    where: { id: formuleId },
    data,
    include: { categorie: true },
  })

  return NextResponse.json(formule)
}

// PATCH /api/admin/formules/[id]
// Déplace la formule vers le haut ou vers le bas dans sa catégorie
// Body : { direction: "up" | "down" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { direction } = await req.json()

  const formule = await prisma.formule.findUnique({ where: { id: parseInt(id) } })
  if (!formule) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  // On cherche la formule voisine dans la même catégorie
  const voisine = await prisma.formule.findFirst({
    where: {
      categorieId: formule.categorieId,
      position: direction === "up"
        ? { lt: formule.position }
        : { gt: formule.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  })

  if (!voisine) {
    // Déjà en haut ou en bas, rien à faire
    return NextResponse.json({ ok: true })
  }

  // Swap des positions entre les deux formules
  await prisma.$transaction([
    prisma.formule.update({ where: { id: formule.id }, data: { position: voisine.position } }),
    prisma.formule.update({ where: { id: voisine.id }, data: { position: formule.position } }),
  ])

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/formules/[id]
// Supprime une formule (attention : la formule ne doit pas avoir de commandes liées)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Suppression en cascade dans l'ordre des dépendances :
  // OrderItems → OrderExtras → Orders → SlotArticles → Slots → Formule
  const slots = await prisma.slot.findMany({ where: { formuleId: parseInt(id) } })
  const slotIds = slots.map(s => s.id)

  await prisma.orderItem.deleteMany({ where: { slotId: { in: slotIds } } })
  await prisma.orderExtra.deleteMany({ where: { order: { formuleId: parseInt(id) } } })
  await prisma.order.deleteMany({ where: { formuleId: parseInt(id) } })
  await prisma.slotArticle.deleteMany({ where: { slotId: { in: slotIds } } })
  await prisma.slot.deleteMany({ where: { formuleId: parseInt(id) } })
  await prisma.formule.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ success: true })
}
