"use client"
import { useLang } from "@/context/LangContext"

export default function Hero() {
  const { t } = useLang()

  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <div className="hero-eyebrow">{t.hero.eyebrow}</div>
        <h1>
          {t.hero.titre1}<br /> <em>{t.hero.titre2}</em><br /> <strong>{t.hero.titre3}</strong>.
        </h1>
        <p className="hero-sub">
          {t.hero.sousTitre}
        </p>
        <div className="hero-actions">
          <a href="#contact" className="btn-lime">{t.hero.ctaDevis}</a>
          <a href="#formules" className="btn-ghost">{t.hero.ctaCommander}</a>
        </div>
      </div>
      <div className="scroll-cue">
        <div className="scroll-line"></div>
      </div>
      <div className="hero-bar">
        <div className="hero-bar-item">
          <strong>📞</strong> 05 40 20 72 43
        </div>
        <div className="hero-bar-sep"></div>
        <div className="hero-bar-item">
          <strong>✉</strong> contact@tsara-rural.fr
        </div>
        <div className="hero-bar-sep"></div>
        <div className="hero-bar-item">
          <strong>📍</strong> Saint-Médard-de-Guizières
        </div>
      </div>
    </section>
  )
}
