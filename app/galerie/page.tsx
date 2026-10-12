import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getDictionnaire, getLangue } from "@/lib/i18n/serveur"
import { traduireContenu } from "@/lib/i18n/contenu"

export const dynamic = 'force-dynamic'

// Page serveur : on interroge directement Prisma, pas besoin de route API
export default async function GaleriePage() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })

  // Composant serveur : pas de useLang(), on lit le cookie directement.
  const t = await getDictionnaire()
  const langue = await getLangue()

  return (
    <main className="galerie-page">
      <div className="galerie-page-header">
        <Link href="/#galerie" className="commander-back">{t.galeriePage.retour}</Link>
        <div>
          <div className="section-label">{t.galerie.label}</div>
          <h1>{t.galerie.titre} <em>{t.galerie.titreEm}</em></h1>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="galerie-page-empty">{t.galeriePage.vide}</p>
      ) : (
        <div className="galerie-page-grid">
          {photos.map(photo => (
            <div key={photo.id} className="galerie-page-item">
              <Image
                src={photo.url}
                // La légende est saisie au dashboard : elle passe par le
                // glossaire de contenu, comme les noms de produits.
                alt={traduireContenu(photo.alt, langue) || t.galeriePage.photoParDefaut}
                width={0}
                height={0}
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              {photo.alt && (
                <p className="galerie-page-caption">{traduireContenu(photo.alt, langue)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
