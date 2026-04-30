import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Tsara — Traiteur artisanal en Gironde',
  description:
    'Petits-déjeuners fermiers artisanaux livrés à domicile, en gîte ou en séminaire. Produits locaux, frais et de saison. Basés à Saint-Médard-de-Guizières, Gironde.',
  keywords: ['traiteur', 'petit-déjeuner', 'Gironde', 'artisanal', 'local', 'livraison', 'Saint-Médard-de-Guizières'],
  metadataBase: new URL('https://www.tsara-rural.fr'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Tsara — Traiteur artisanal en Gironde',
    description:
      'Petits-déjeuners fermiers artisanaux livrés à domicile, en gîte ou en séminaire. Produits locaux, frais et de saison.',
    url: 'https://www.tsara-rural.fr',
    siteName: 'Tsara Traiteur',
    locale: 'fr_FR',
    type: 'website',
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Tsara Traiteur",
  "url": "https://www.tsara-rural.fr",
  "telephone": "+33540207243",
  "email": "contact@tsara-rural.fr",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Saint-Médard-de-Guizières",
    "addressLocality": "Saint-Médard-de-Guizières",
    "postalCode": "33230",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.0167,
    "longitude": -0.0667
  },
  "servesCuisine": "Petits-déjeuners artisanaux",
  "priceRange": "€€",
  "description": "Petits-déjeuners fermiers artisanaux livrés à domicile, en gîte ou en séminaire. Produits locaux, frais et de saison.",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 45.0167,
      "longitude": -0.0667
    },
    "geoRadius": "20000"
  },
  "sameAs": [
    "https://www.instagram.com/tsara_rural"
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
