"use client"
import { useEffect, useRef, useState } from "react"
import { useLang } from "@/context/LangContext"
import { LANGUES, LIBELLES_LANGUE } from "@/lib/i18n/config"

export default function LangSwitcher() {
  const { langue, setLangue, t } = useLang()
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef<HTMLDivElement>(null)

  // Fermer au clic à l'extérieur et à la touche Échap.
  //
  // Sans ça, un menu ouvert reste ouvert indéfiniment : cliquer ailleurs sur
  // la page ne le ferme pas, ce que tout le monde attend d'un menu déroulant.
  useEffect(() => {
    if (!ouvert) return

    function clicDehors(e: MouseEvent) {
      // contains() couvre les enfants : cliquer SUR une option du menu ne
      // doit pas être traité comme un clic à l'extérieur.
      if (conteneur.current && !conteneur.current.contains(e.target as Node)) {
        setOuvert(false)
      }
    }
    function echap(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false)
    }

    document.addEventListener("mousedown", clicDehors)
    document.addEventListener("keydown", echap)
    return () => {
      document.removeEventListener("mousedown", clicDehors)
      document.removeEventListener("keydown", echap)
    }
  }, [ouvert])

  const courante = LIBELLES_LANGUE[langue]

  return (
    <div className="lang-switcher" ref={conteneur}>
      <button
        type="button"
        className="lang-bouton"
        onClick={() => setOuvert((o) => !o)}
        // aria-expanded annonce aux lecteurs d'écran si le menu est ouvert,
        // aria-haspopup qu'il en existe un. Sans eux, le bouton se présente
        // comme une action ordinaire, sans indiquer qu'il révèle un choix.
        aria-expanded={ouvert}
        aria-haspopup="listbox"
        aria-label={t.nav.langue}
      >
        <span className="lang-drapeau">{courante.drapeau}</span>
        <span className="lang-court">{courante.court}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {ouvert && (
        <ul className="lang-menu" role="listbox" aria-label={t.nav.langue}>
          {LANGUES.map((l) => {
            const item = LIBELLES_LANGUE[l]
            const active = l === langue
            return (
              <li key={l} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`lang-option ${active ? "lang-option-active" : ""}`}
                  onClick={() => {
                    setLangue(l)
                    setOuvert(false)
                  }}
                >
                  <span className="lang-drapeau">{item.drapeau}</span>
                  <span className="lang-nom">{item.nom}</span>
                  {/* La coche est décorative : aria-selected porte déjà
                      l'information pour les lecteurs d'écran. */}
                  {active && <span className="lang-coche" aria-hidden="true">✓</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
