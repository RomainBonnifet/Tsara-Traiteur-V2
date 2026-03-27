import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
  }

  // On cherche le user — message volontairement vague pour ne pas révéler
  // si l'email existe ou non (bonne pratique sécurité)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
  }

  // compare() compare le mot de passe en clair avec le hash stocké en base
  const valid = await compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
  }

  // On crée le token avec les infos minimales nécessaires
  const token = await createToken({ userId: user.id, role: user.role })

  // On place le token dans un cookie HttpOnly :
  // HttpOnly = JavaScript côté client ne peut PAS lire ce cookie
  // C'est une protection contre les attaques XSS
  const response = NextResponse.json({ email: user.email, role: user.role })
  response.cookies.set("tsara-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS uniquement en prod
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours en secondes
    path: "/"
  })

  return response
}
