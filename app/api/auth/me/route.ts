import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const payload = await getCurrentUser()
  if (!payload) return NextResponse.json(null)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true } // on n'expose jamais le mot de passe
  })

  return NextResponse.json(user)
}
