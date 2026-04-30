import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { nom, telephone, email, prestation, date, nbPersonnes, message } = await req.json()

  if (!nom || !telephone) {
    return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 })
  }

  try {
    const { error } = await resend.emails.send({
      from: "contact@tsara-rural.fr",
      to: "contact@tsara-rural.fr",
      subject: `Nouvelle demande de contact — ${nom}`,
      html: `
        <h2>Nouvelle demande de contact</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:8px;font-weight:bold;color:#555">Nom</td><td style="padding:8px">${nom}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Téléphone</td><td style="padding:8px">${telephone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Email</td><td style="padding:8px">${email || "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Type de prestation</td><td style="padding:8px">${prestation || "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Date souhaitée</td><td style="padding:8px">${date || "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Nb personnes</td><td style="padding:8px">${nbPersonnes || "—"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Message</td><td style="padding:8px">${message || "—"}</td></tr>
        </table>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Contact route exception:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
