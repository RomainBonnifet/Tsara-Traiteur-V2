import Image from 'next/image'

const partners = [
  {
    href: 'https://glace-a-la-ferme-bodard.fr/',
    src: '/img/Suppliers/fermeBodard.png',
    alt: 'Ferme Bodard',
  },
  {
    href: 'https://www.facebook.com/fermedesjarouilles',
    src: '/img/Suppliers/fermeDesJarouilles.jpg',
    alt: 'Jarouilles',
  },
  {
    href: 'https://fermedurivaud.com/',
    src: '/img/Suppliers/fermeDuRivaud.jpg',
    alt: 'Rivaud',
  },
  {
    href: 'https://www.facebook.com/laiterie.artisanale',
    src: '/img/Suppliers/laitDelices.png',
    alt: 'Lait Délices',
  },
  {
    href: 'https://www.letempsdessaisons-primeurs.fr/',
    src: '/img/Suppliers/leTempsDesSaisons.jpg',
    alt: 'Tps Saisons',
  },
  {
    href: 'https://lafermedelaclavette.com/',
    src: '/img/Suppliers/fermeLaclavette.jpg',
    alt: 'Laclavette',
  },
  {
    href: 'https://www.la-toque-cuivree.fr/',
    src: '/img/Suppliers/laToqueCuivre.png',
    alt: 'Toque Cuivrée',
  },
]

export default function Partenaires() {
  return (
    <section className="partenaires reveal" id="partenaires">
      <div className="section-label">Ils nous font confiance</div>
      <h2>Nos <em>partenaires</em></h2>
      <p>Des producteurs locaux soigneusement sélectionnés</p>
      <div className="partenaires-logos">
        {partners.map((p) => (
          <a key={p.alt} href={p.href} target="_blank" rel="noopener noreferrer" className="partner-logo">
            <Image src={p.src} alt={p.alt} width={100} height={65} style={{ objectFit: 'contain' }} />
          </a>
        ))}
      </div>
    </section>
  )
}
