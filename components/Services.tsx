"use client"
import { useLang } from "@/context/LangContext"

export default function Services() {
  const { t } = useLang()

  return (
    <section className="services reveal" id="services">
      <div className="section-label">{t.services.label}</div>
      <h2>{t.services.titre} <em>{t.services.titreEm}</em></h2>
      <p className="services-sub">{t.services.sousTitre}</p>
      <div className="services-list">
        <div className="service-row">
          <div className="service-num">01</div>
          <div className="service-content">
            <h3>{t.services.s1Titre}</h3>
            <p>{t.services.s1Texte}</p>
          </div>
          <span className="service-pill">{t.services.zoneLocale}</span>
        </div>
        <div className="service-row">
          <div className="service-num">02</div>
          <div className="service-content">
            <h3>{t.services.s2Titre}</h3>
            <p>{t.services.s2Texte}</p>
            <p className="service-disclaimer">{t.services.s2Avertissement}</p>
          </div>
          <span className="service-pill">{t.services.zoneLocale}</span>
        </div>
        <div className="service-row">
          <div className="service-num">03</div>
          <div className="service-content">
            <h3>{t.services.s3Titre}</h3>
            <p>{t.services.s3Texte}</p>
          </div>
          <span className="service-pill">{t.services.zoneRegion}</span>
        </div>
      </div>
    </section>
  )
}
