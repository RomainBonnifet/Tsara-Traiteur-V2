import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// GET — liste toutes les photos (pour le dashboard)
export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(photos)
}

// POST — reçoit un fichier via FormData, l'enregistre sur disque + en base
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("photo") as File
  const alt = (formData.get("alt") as string) || ""

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
  }

  // On génère un nom de fichier unique avec le timestamp pour éviter les collisions
  const ext = file.name.split(".").pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "galerie")
  const filePath = path.join(uploadDir, filename)

  // Convertit le File en Buffer pour l'écrire sur disque
  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  const photo = await prisma.photo.create({
    data: { url: `/uploads/galerie/${filename}`, alt },
  })

  return NextResponse.json(photo)
}
