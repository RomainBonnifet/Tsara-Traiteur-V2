import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Tsara — Traiteur artisanal en Gironde',
  description:
    'Petits-déjeuners fermiers artisanaux livrés à domicile, en gîte ou en séminaire. Produits locaux, frais et de saison. Basés à Saint-Médard-de-Guizières, Gironde.',
  keywords: ['traiteur', 'petit-déjeuner', 'Gironde', 'artisanal', 'local', 'livraison', 'Saint-Médard-de-Guizières'],
  openGraph: {
    title: 'Tsara — Traiteur artisanal en Gironde',
    description:
      'Petits-déjeuners fermiers artisanaux livrés à domicile, en gîte ou en séminaire. Produits locaux, frais et de saison.',
    locale: 'fr_FR',
    type: 'website',
  },
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
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
