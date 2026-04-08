import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// DELETE — supprime la photo en base ET le fichier sur disque
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

  // Supprime le fichier physique (on ignore l'erreur si le fichier n'existe plus)
  try {
    const filePath = path.join(process.cwd(), "public", photo.url)
    await unlink(filePath)
  } catch {
    // fichier déjà absent, on continue quand même
  }

  await prisma.photo.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
