import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET — liste toutes les photos
export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(photos)
}

// POST — upload vers Cloudinary + sauvegarde en base
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

  // Convertit le File en Buffer pour l'envoyer à Cloudinary
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Upload via le stream Cloudinary (la méthode qui accepte un Buffer)
  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "tsara/galerie" }, (error, res) => {
          if (error || !res) reject(error)
          else resolve(res)
        })
        .end(buffer)
    }
  )

  const photo = await prisma.photo.create({
    data: { url: result.secure_url, publicId: result.public_id, alt },
  })

  return NextResponse.json(photo)
}
