import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { COOKIE_LANGUE, LANGUE_DEFAUT, estLangueValide } from '@/lib/i18n/config'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import Providers from './providers'

// Les polices sont téléchargées au BUILD et servies depuis notre domaine.
// `variable` génère une variable CSS que globals.css consomme, plutôt que
// d'imposer une classe sur chaque élément.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-jost',
})

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

// async : cookies() lit la requete en cours. Consequence a connaitre, la
// page n est plus pregeneree au build mais rendue a chaque requete. C est le
// prix d un premier affichage deja dans la bonne langue ; sur un site de cette
// taille, le cout est negligeable.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const choix = (await cookies()).get(COOKIE_LANGUE)?.value
  const langue = estLangueValide(choix) ? choix : LANGUE_DEFAUT

  return (
    // lang est lu par les lecteurs d ecran (prononciation) et par les moteurs
    // de recherche. Il doit suivre la langue reellement affichee.
    <html lang={langue} className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers langue={langue}>{children}</Providers>
      </body>
    </html>
  )
}
