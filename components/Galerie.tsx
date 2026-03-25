const PhSvg = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

export default function Galerie() {
  return (
    <section className="galerie reveal" id="galerie">
      <div className="galerie-header">
        <div>
          <div className="section-label">Nos réalisations</div>
          <h2>La <em>galerie</em></h2>
        </div>
        <a href="#" className="galerie-link">Voir toutes les photos →</a>
      </div>
      <div className="galerie-grid">
        <div className="galerie-item">
          <div className="ph"><PhSvg />Photo principale</div>
        </div>
        <div className="galerie-item"><div className="ph">Photo 2</div></div>
        <div className="galerie-item"><div className="ph">Photo 3</div></div>
        <div className="galerie-item"><div className="ph">Photo 4</div></div>
        <div className="galerie-item"><div className="ph">Photo 5</div></div>
      </div>
    </section>
  )
}
