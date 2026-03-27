import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Next.js parse automatiquement le body des requêtes en JSON.
// Pour Stripe, on a besoin du body brut (raw) pour vérifier la signature.
// Ce export dit à Next.js de ne pas toucher au body.
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    // constructEvent vérifie que l'appel vient vraiment de Stripe
    // grâce à la signature et au webhook secret
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  // On n'agit que sur l'événement "paiement réussi"
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // On récupère les IDs des commandes qu'on avait passés en metadata
    const orderIds = session.metadata?.orderIds?.split(",").map(Number) || []

    // On met toutes les commandes à "payee"
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { statut: "payee" }
    })
  }

  return NextResponse.json({ received: true })
}
