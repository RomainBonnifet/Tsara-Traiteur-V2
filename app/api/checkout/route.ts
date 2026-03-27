import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { CartItem } from "@/context/CartContext"
import { verifierRayon } from "@/lib/geo"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  // 1. Vérifier que l'utilisateur est connecté
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const { items, livraison }: { items: CartItem[]; livraison: { telephone: string; date: string; adresse: string } } = await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 })
  }

  // Vérifier si le panier contient au moins une formule Individuelle.
  // On interroge la DB avec les formuleIds du panier — le frontend ne doit pas
  // être la seule source de vérité sur la catégorie.
  const formuleIds = items.map(item => item.formuleId)
  const formules = await prisma.formule.findMany({
    where: { id: { in: formuleIds } },
    include: { categorie: true },
  })
  const hasIndividuel = formules.every(f => f.categorie.nom !== "Groupe")

  if (hasIndividuel) {
    const rayonCheck = await verifierRayon(livraison.adresse)
    if (!rayonCheck.ok) {
      return NextResponse.json({ error: rayonCheck.message }, { status: 422 })
    }
  }

  // 2. Créer les commandes en base (une par item du panier)
  // On les crée en "en_attente" — elles passeront à "payee" via le webhook Stripe
  const orderIds: number[] = []

  for (const item of items) {
    const order = await prisma.order.create({
      data: {
        userId: currentUser.userId,
        formuleId: item.formuleId,
        nbPersonnes: item.nbPersonnes,
        montantTotal: item.subtotal,
        statut: "en_attente",
        telephone: livraison.telephone,
        dateLivraison: new Date(livraison.date),
        adresse: livraison.adresse,
        // On aplatit les sélections : une OrderItem par slot/article par personne
        items: {
          create: item.selections.flatMap(personSel =>
            Object.entries(personSel).map(([slotId, sel]) => ({
              slotId: Number(slotId),
              articleId: sel.articleId,
            }))
          )
        },
        extras: {
          create: item.extras.map(e => ({
            extraId: e.extraId,
            quantite: e.quantite,
          }))
        }
      }
    })
    orderIds.push(order.id)
  }

  // 3. Récupérer l'email de l'utilisateur pour que Stripe puisse envoyer le reçu
  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
    select: { email: true }
  })

  // 4. Créer la session Stripe Checkout
  // On convertit chaque item du panier en "line_item" Stripe
  const lineItems = items.map(item => ({
    price_data: {
      currency: "eur",
      product_data: {
        name: `Formule ${item.formuleNom}`,
        description: `${item.nbPersonnes} personne${item.nbPersonnes > 1 ? "s" : ""}`,
      },
      // Stripe travaille en centimes : 12.50€ → 1250
      unit_amount: Math.round(item.subtotal * 100),
    },
    quantity: 1,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    customer_email: user?.email,  // Stripe envoie le reçu à cet email
    metadata: { orderIds: orderIds.join(",") },
    success_url: `${process.env.NEXT_PUBLIC_URL}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/panier`,
  })

  return NextResponse.json({ url: session.url })
}
