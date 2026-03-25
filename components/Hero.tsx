export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content">
        <div className="hero-eyebrow">Traiteur artisanal · Gironde</div>
        <h1>
          Votre <em>petit-<br />déjeuner</em> livré
        </h1>
        <p className="hero-sub">
          Des produits locaux, frais et de saison. Pour vos matins en famille, en gîte ou en séminaire.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="btn-lime">Réserver maintenant</a>
          <a href="#formules" className="btn-ghost">Voir les formules</a>
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
