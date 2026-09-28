"use client"
import Image from "next/image"
import { useLang } from "@/context/LangContext"

const PHOTOS = [
  { src: "/img/Photos/pdj.jpg", alt: "Plateau petit-déjeuner Tsara" },
  { src: "/img/Photos/potyahourt.png", alt: "Viennoiseries artisanales" },
  { src: "/img/Photos/charcut.jpg", alt: "Produits locaux" },
  { src: "/img/Photos/viennoiserie.jpg", alt: "Préparation plateau" },
  { src: "/img/Photos/plateau-fruit.jpg", alt: "Petit-déjeuner en gîte" },
]

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
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
