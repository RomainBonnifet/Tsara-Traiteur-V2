import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  // On supprime le cookie en lui donnant une date d'expiration passée
  response.cookies.set("tsara-token", "", { maxAge: 0, path: "/" })
  return response
}
