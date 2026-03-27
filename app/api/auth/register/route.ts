import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // Validation basique
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
  }

  // Vérifier que l'email n'est pas déjà utilisé
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
  }

  // hash(password, 12) : le 12 est le "salt rounds" — plus c'est élevé, plus c'est lent
  // mais aussi plus sécurisé. 12 est un bon compromis en production.
  const hashedPassword = await hash(password, 12)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
