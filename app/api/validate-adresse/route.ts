import { NextRequest, NextResponse } from "next/server"
import { getLangue } from "@/lib/i18n/serveur"
import fr from "@/lib/i18n/fr"
import en from "@/lib/i18n/en"
import { verifierRayon } from "@/lib/geo"

// POST /api/validate-adresse
// Reçoit { adresse: string }, retourne { ok, label } ou { ok: false, message }
// Cette route est le seul endroit où le frontend peut déclencher la vérification
// de rayon — les coordonnées du client restent côté serveur dans .env.
export async function POST(req: NextRequest) {
  const { adresse } = await req.json()

  // Lue une fois : les deux réponses possibles de cette route en dépendent.
  const langue = await getLangue()
  const e = (langue === "en" ? en : fr).erreurs

  if (!adresse || adresse.trim() === "") {
    return NextResponse.json({ ok: false, message: e.adresseVide }, { status: 400 })
  }

  // La langue est transmise : « hors de la zone de livraison » s'affiche
  // sous le champ d'adresse du panier, c'est un message vu par le client.
  const result = await verifierRayon(adresse, langue)
  return NextResponse.json(result)
}
