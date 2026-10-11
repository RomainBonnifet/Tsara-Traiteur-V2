import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/adminAuth"

// PUT /api/admin/categories/[id]
// Modifie une catégorie : { nom?, visiblePublic?, creneaux? }
//
// Ces trois réglages n'étaient jusqu'ici modifiables que par un script lancé
// à la main. Les exposer au dashboard évite un déploiement à chaque fois que
// le traiteur veut masquer une offre ou décaler un horaire de livraison.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const categorieId = parseInt(id)
  if (!Number.isInteger(categorieId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 })
  }

  const { nom, visiblePublic, creneaux } = await req.json()

  // ── Le nom ──
  // Renommer une catégorie a des conséquences que l'admin ne voit pas :
  // components/Formules.tsx et lib/i18n indexent leurs textes par ce nom.
  // On ne l'interdit pas (c'est son catalogue), mais on refuse au moins le
  // vide, qui laisserait une section sans titre.
  if (nom !== undefined && (typeof nom !== "string" || nom.trim() === "")) {
    return NextResponse.json({ error: "Le nom ne peut pas être vide." }, { status: 400 })
  }

  // ── Les créneaux ──
  // Tableau de chaînes, nettoyé ici et pas seulement à l'affichage : ces
  // valeurs sont ensuite comparées à l'identique par /api/checkout pour
  // valider le choix du client. Un espace en trop ferait échouer la commande.
  let creneauxPropres: string[] | undefined
  if (creneaux !== undefined) {
    if (!Array.isArray(creneaux)) {
      return NextResponse.json({ error: "Créneaux invalides." }, { status: 400 })
    }
    creneauxPropres = Array.from(
      new Set(
        creneaux
          .filter((c): c is string => typeof c === "string")
          .map((c) => c.replace(/\s+/g, " ").trim())
          .filter((c) => c.length > 0 && c.length <= 60)
      )
    )
  }

  // ── La visibilité ──
  // Masquer une catégorie retire ses formules du site ET empêche de les
  // commander (voir lib/panier.ts). On prévient l'admin plutôt que de le
  // laisser découvrir qu'il a fermé sa boutique : le dashboard affiche le
  // nombre de formules concernées avant de valider.
  try {
    const categorie = await prisma.categorie.update({
      where: { id: categorieId },
      data: {
        ...(nom !== undefined && { nom: nom.trim() }),
        ...(visiblePublic !== undefined && { visiblePublic: Boolean(visiblePublic) }),
        ...(creneauxPropres !== undefined && { creneaux: creneauxPropres }),
      },
      select: {
        id: true,
        nom: true,
        visiblePublic: true,
        creneaux: true,
        _count: { select: { formules: true } },
      },
    })
    return NextResponse.json(categorie)
  } catch (err) {
    // "nom" porte une contrainte UNIQUE : deux catégories ne peuvent pas
    // partager un nom. Prisma lève P2002 dans ce cas — un message clair vaut
    // mieux qu'une erreur 500 que l'admin ne saurait pas interpréter.
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "Une autre catégorie porte déjà ce nom." },
        { status: 409 }
      )
    }
    throw err
  }
}
