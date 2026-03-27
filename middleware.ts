import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Les routes qui nécessitent d'être connecté
const PROTECTED = ["/panier", "/commande", "/dashboard"]

// Les routes réservées à l'admin
const ADMIN_ONLY = ["/dashboard"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Est-ce que cette route est protégée ?
  const isProtected = PROTECTED.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  // On lit le cookie JWT
  const token = req.cookies.get("tsara-token")?.value

  if (!token) {
    // Pas de token → on redirige vers /connexion
    // On garde l'URL de destination pour y revenir après connexion
    const url = req.nextUrl.clone()
    url.pathname = "/connexion"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // On vérifie que le token est valide et non expiré
  const payload = await verifyToken(token)

  if (!payload) {
    // Token invalide ou expiré
    const url = req.nextUrl.clone()
    url.pathname = "/connexion"
    return NextResponse.redirect(url)
  }

  // Route admin : on vérifie le rôle
  const isAdminRoute = ADMIN_ONLY.some(route => pathname.startsWith(route))
  if (isAdminRoute && payload.role !== "admin") {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Ce config dit à Next.js sur quelles URLs exécuter ce middleware
// On exclut les fichiers statiques et les routes API pour éviter les boucles
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
