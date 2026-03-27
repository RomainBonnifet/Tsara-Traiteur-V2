import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 })
  }

  // On génère un nom unique pour éviter les collisions
  const ext = file.name.split(".").pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // On sauvegarde dans /public/uploads/ — servi directement par Next.js
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename)
  await writeFile(uploadPath, buffer)

  // On retourne le chemin public accessible depuis le navigateur
  return NextResponse.json({ url: `/uploads/${filename}` })
}
