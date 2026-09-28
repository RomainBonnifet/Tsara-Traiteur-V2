'use client'
import Image from 'next/image'
import { useLang } from '@/context/LangContext'

// L'ordre du tableau = l'ordre d'affichage.
// `name` sert à la fois au libellé visible et à l'alt de l'image :
// une seule source de vérité, impossible de les désynchroniser.
const partners = [
  {
    name: 'La Ferme de la Clavette',
    href: 'https://lafermedelaclavette.com/',
    src: '/img/Suppliers/fermeLaclavette.jpg',
  },
  {
    name: 'Ferme Bodard',
    href: 'https://glace-a-la-ferme-bodard.fr/',
    src: '/img/Suppliers/fermeBodard.png',
  },
  {
    name: 'La Ferme des Jarouilles',
    href: 'https://www.facebook.com/fermedesjarouilles',
    src: '/img/Suppliers/fermeDesJarouilles.jpg',
  },
  {
    name: 'La Ferme du Rivaud',
    href: 'https://fermedurivaud.com/',
    src: '/img/Suppliers/fermeDuRivaud.jpg',
  },
  {
    name: 'La Toque Cuivrée',
    href: 'https://www.la-toque-cuivree.fr/',
    src: '/img/Suppliers/laToqueCuivre.png',
  },
]

export default function Partenaires() {
  const { t } = useLang()

  return (
    <section className="partenaires reveal" id="partenaires">
      <div className="partenaires-header">
        <div className="partenaires-intro">
          <div className="section-label">{t.partenaires.label}</div>
          <h2>{t.partenaires.titre}</h2>
        </div>
        <p className="partenaires-baseline">
          {t.partenaires.baseline}
        </p>
      </div>

      <div className="partenaires-grid">
        {partners.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-card"
          >
            <div className="partner-card-logo">
              <Image
                src={p.src}
                alt={`Logo ${p.name}`}
                width={180}
                height={120}
              />
            </div>
            <span className="partner-card-name">
              {p.name}
              {/* aria-hidden : l'icône est décorative, le lecteur d'écran
                  annonce déjà « lien » et le nom du partenaire */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 16 16 8M9 8h7v7" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
