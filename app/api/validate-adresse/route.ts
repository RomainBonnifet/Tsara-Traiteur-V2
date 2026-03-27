import { NextRequest, NextResponse } from "next/server"
import { verifierRayon } from "@/lib/geo"

// POST /api/validate-adresse
// Reçoit { adresse: string }, retourne { ok, label } ou { ok: false, message }
// Cette route est le seul endroit où le frontend peut déclencher la vérification
// de rayon — les coordonnées du client restent côté serveur dans .env.
export async function POST(req: NextRequest) {
  const { adresse } = await req.json()

  if (!adresse || adresse.trim() === "") {
    return NextResponse.json({ ok: false, message: "Adresse vide." }, { status: 400 })
  }

  const result = await verifierRayon(adresse)
  return NextResponse.json(result)
}
