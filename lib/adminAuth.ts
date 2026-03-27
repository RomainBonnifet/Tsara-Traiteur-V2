import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// requireAdmin vérifie que l'utilisateur est connecté ET qu'il est admin.
// On centralise cette logique ici pour ne pas la répéter dans chaque route API.
// Retourne le payload (userId, role) si tout est OK,
// sinon retourne directement une NextResponse avec le bon code d'erreur.

export async function requireAdmin(): Promise<
  { userId: number; role: string } | NextResponse
> {
  const user = await getCurrentUser()

  // Pas de token ou token invalide → 401 Non authentifié
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Connecté mais pas admin → 403 Accès interdit
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  return user
}
