'use client'
import { useLang } from '@/context/LangContext'

// Les valeurs affichées sont regroupées ici, en haut du fichier :
// quand la note évoluera, il y a un seul endroit à modifier.
const NOTE = 5
const NOTE_MAX = 5

// TODO : remplacer par l'URL de la fiche Google Business du client.
// En attendant, cette recherche Google est fonctionnelle et mène au bon endroit.
const GOOGLE_URL =
  'https://www.google.com/search?q=Tsara+Traiteur+Saint-M%C3%A9dard-de-Guizi%C3%A8res'

export default function Avis() {
  const { t } = useLang()

  return (
    <section className="avis reveal" id="avis">
      <div className="avis-intro">
        <div className="section-label">{t.avis.label}</div>
        <h2>
          {t.avis.titre}
          <br />
          <em>{t.avis.titreEm}</em>
        </h2>
        <p>{t.avis.texte}</p>
      </div>

      <div className="avis-card">
        <div className="avis-card-label">{t.avis.noteLabel}</div>

        <div className="avis-note">
          <span className="avis-note-valeur">{NOTE}</span>
          <span className="avis-note-max">/ {NOTE_MAX}</span>
        </div>

        {/* Les 5 SVG sont purement décoratifs (aria-hidden) : c'est le
            conteneur qui porte l'information, énoncée une seule fois. */}
        <div
          className="avis-etoiles"
          role="img"
          aria-label={`${NOTE} ${t.avis.etoiles} ${NOTE_MAX}`}
        >
          {Array.from({ length: NOTE_MAX }, (_, i) => (
            <svg
              key={i}
              className={i < NOTE ? 'avis-etoile' : 'avis-etoile vide'}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>

        <a
          href={GOOGLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="avis-lien"
        >
          {t.avis.lien}
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
        </a>
      </div>
    </section>
  )
}
