import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Page serveur : on interroge directement Prisma, pas besoin de route API
export default async function GaleriePage() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <main className="galerie-page">
      <div className="galerie-page-header">
        <Link href="/#galerie" className="commander-back">← Retour</Link>
        <div>
          <div className="section-label">Nos réalisations</div>
          <h1>La <em>galerie</em></h1>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="galerie-page-empty">Aucune photo pour l&apos;instant.</p>
      ) : (
        <div className="galerie-page-grid">
          {photos.map(photo => (
            <div key={photo.id} className="galerie-page-item">
              <Image
                src={photo.url}
                alt={photo.alt || "Photo Tsara Traiteur"}
                width={0}
                height={0}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              {photo.alt && <p className="galerie-page-caption">{photo.alt}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
