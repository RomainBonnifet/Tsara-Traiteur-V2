import Image from "next/image"

const PHOTOS = [
  { src: "/img/Photos/pdj.jpg", alt: "Plateau petit-déjeuner Tsara" },
  { src: "/img/Photos/potyahourt.png", alt: "Viennoiseries artisanales" },
  { src: "/img/Photos/charcut.jpg", alt: "Produits locaux" },
  { src: "/img/Photos/viennoiserie.jpg", alt: "Préparation plateau" },
  { src: "/img/Photos/plateau-fruit.jpg", alt: "Petit-déjeuner en gîte" },
]

export default function Galerie() {
  return (
    <section className="galerie reveal" id="galerie">
      <div className="galerie-header">
        <div>
          <div className="section-label">Nos réalisations</div>
          <h2>La <em>galerie</em></h2>
        </div>
        <a href="/galerie" className="galerie-link">Voir toutes les photos →</a>
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
