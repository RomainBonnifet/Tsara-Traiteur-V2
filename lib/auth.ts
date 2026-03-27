import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

// La clé secrète qui signe les tokens — doit être dans .env en production
// TextEncoder convertit la string en bytes (format requis par jose)
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tsara-secret-dev"
)

// ── Créer un token JWT ──────────────────────────────────────────────────────
// payload = les données qu'on veut stocker dans le token (userId, role)
export async function createToken(payload: { userId: number; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // algorithme de signature
    .setExpirationTime("7d")              // expire dans 7 jours
    .sign(SECRET)
}

// ── Vérifier et décoder un token JWT ───────────────────────────────────────
// Retourne le payload si valide, null si invalide ou expiré
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { userId: number; role: string }
  } catch {
    return null
  }
}

// ── Lire l'utilisateur connecté depuis le cookie ────────────────────────────
// Pratique pour récupérer le user courant dans n'importe quelle route API
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("tsara-token")?.value
  if (!token) return null
  return verifyToken(token)
}
