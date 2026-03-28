import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  console.log("[webhook] requête reçue")
  console.log("[webhook] signature présente :", !!signature)
  console.log("[webhook] secret présent :", !!process.env.STRIPE_WEBHOOK_SECRET)

  if (!signature) {
    console.log("[webhook] ERREUR : pas de signature")
    return NextResponse.json({ error: "Pas de signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log("[webhook] signature OK, event :", event.type)
  } catch (err) {
    console.log("[webhook] ERREUR signature :", err)
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderIds = session.metadata?.orderIds?.split(",").map(Number) || []
    console.log("[webhook] orderIds à mettre à jour :", orderIds)
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { statut: "payee" }
    })
    console.log("[webhook] commandes mises à jour")
  }

  return NextResponse.json({ received: true })
}
