"use client"
import Image from "next/image"
import { useLang } from "@/context/LangContext"

// Le texte alternatif n'est plus écrit ici mais désigné par une clé : il se
// traduit comme le reste du site. "as const" fige les clés en littéraux,
// ce qui permet à TypeScript de vérifier qu'elles existent dans t.alt.
const PHOTOS = [
  { src: "/img/Photos/pdj.jpg", cle: "photo1" },
  { src: "/img/Photos/potyahourt.png", cle: "photo2" },
  { src: "/img/Photos/charcut.jpg", cle: "photo3" },
  { src: "/img/Photos/viennoiserie.jpg", cle: "photo4" },
  { src: "/img/Photos/plateau-fruit.jpg", cle: "photo5" },
] as const

export default function Galerie() {
  const { t } = useLang()

  return (
    <section className="galerie reveal" id="galerie">
      <div className="galerie-header">
        <div>
          <div className="section-label">{t.galerie.label}</div>
          <h2>{t.galerie.titre} <em>{t.galerie.titreEm}</em></h2>
        </div>
        <a href="/galerie" className="galerie-link">{t.galerie.lien}</a>
      </div>
      <div className="galerie-grid">
        {PHOTOS.map((photo, i) => (
          <div className="galerie-item" key={i}>
            <Image
              src={photo.src}
              alt={t.alt[photo.cle]}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
