import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// DELETE — supprime la photo sur Cloudinary ET en base
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const photo = await prisma.photo.findUnique({ where: { id: Number(params.id) } })
  if (!photo) return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })

  // Supprime sur Cloudinary si on a le publicId
  if (photo.publicId) {
    await cloudinary.uploader.destroy(photo.publicId)
  }

  await prisma.photo.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
