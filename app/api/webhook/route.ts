import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
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

    // Récupère les commandes complètes pour l'email de confirmation
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        user: { select: { email: true } },
        formule: true,
        items: { include: { slot: true, article: true } },
        extras: { include: { extra: true } },
      }
    })

    const userEmail = orders[0]?.user?.email
    if (!userEmail) {
      console.log("[webhook] pas d'email utilisateur, mail non envoyé")
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const dateStr = orders[0].dateLivraison
        ? new Date(orders[0].dateLivraison).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "—"

      const montantTotal = orders.reduce((sum, o) => sum + o.montantTotal, 0)

      const commandesHtml = orders.map(order => `
        <div style="margin-bottom:24px;padding:16px;background:#faf8f4;border-radius:6px;">
          <h3 style="margin:0 0 12px;font-size:16px;color:#3a2a1a;">${order.formule.nom} — ${order.nbPersonnes} personne${order.nbPersonnes > 1 ? "s" : ""}</h3>
          ${Object.entries(
            order.items.reduce<Record<string, string[]>>((acc, item) => {
              const slotNom = item.slot.nom
              if (!acc[slotNom]) acc[slotNom] = []
              acc[slotNom].push(item.article.nom)
              return acc
            }, {})
          ).map(([slot, articles]) => `
            <div style="margin-bottom:6px;">
              <span style="font-weight:600;color:#555;font-size:13px;">${slot} :</span>
              <span style="color:#333;font-size:13px;"> ${articles.join(", ")}</span>
            </div>
          `).join("")}
          ${order.extras.length > 0 ? `
            <div style="margin-top:8px;border-top:1px solid #e8e0d4;padding-top:8px;">
              <span style="font-weight:600;color:#555;font-size:13px;">Extras :</span>
              ${order.extras.map(e => `<span style="font-size:13px;color:#333;"> ${e.extra.nom} × ${e.quantite}</span>`).join(",")}
            </div>
          ` : ""}
          <div style="margin-top:10px;text-align:right;font-weight:700;color:#3a2a1a;">${order.montantTotal.toFixed(2)} €</div>
        </div>
      `).join("")

      await resend.emails.send({
        from: "contact@tsara-rural.fr",
        to: userEmail,
        subject: `Confirmation de commande — Tsara Traiteur`,
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto;color:#3a2a1a;">
            <div style="background:#2d4a0e;padding:28px 32px;border-radius:8px 8px 0 0;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">Tsara Traiteur</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Confirmation de commande</p>
            </div>

            <div style="padding:28px 32px;background:#fff;border:1px solid #e8e0d4;border-top:none;">
              <p style="font-size:15px;margin:0 0 24px;">Merci pour votre commande ! Voici le récapitulatif de votre petit-déjeuner.</p>

              ${commandesHtml}

              <div style="background:#2d4a0e;color:#fff;padding:14px 16px;border-radius:6px;display:flex;justify-content:space-between;margin-bottom:24px;">
                <span style="font-size:15px;font-weight:600;">Total payé</span>
                <span style="font-size:15px;font-weight:700;">${montantTotal.toFixed(2)} €</span>
              </div>

              <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#888;margin:0 0 12px;">Informations de livraison</h3>
              <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:#888;">Date</td><td style="padding:5px 0;font-weight:600;">${dateStr}</td></tr>
                <tr><td style="padding:5px 0;color:#888;">Créneau</td><td style="padding:5px 0;font-weight:600;">${orders[0].creneauLivraison || "—"}</td></tr>
                <tr><td style="padding:5px 0;color:#888;">Adresse</td><td style="padding:5px 0;font-weight:600;">${orders[0].adresse || "—"}</td></tr>
                <tr><td style="padding:5px 0;color:#888;">Téléphone</td><td style="padding:5px 0;font-weight:600;">${orders[0].telephone || "—"}</td></tr>
              </table>
            </div>

            <div style="padding:16px 32px;background:#f5f2ed;border-radius:0 0 8px 8px;border:1px solid #e8e0d4;border-top:none;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">Une question ? Contactez-nous à <a href="mailto:contact@tsara-rural.fr" style="color:#2d4a0e;">contact@tsara-rural.fr</a></p>
            </div>
          </div>
        `
      })
      console.log("[webhook] email de confirmation envoyé à", userEmail)
    }
  }

  return NextResponse.json({ received: true })
}
