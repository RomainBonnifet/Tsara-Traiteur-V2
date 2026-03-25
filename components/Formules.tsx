const FormuleImgPlaceholder = ({ label }: { label: string }) => (
  <div className="formule-img">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    {label}
  </div>
)

export default function Formules() {
  return (
    <section className="formules reveal" id="formules">
      <div className="formules-header">
        <div className="section-label">Nos offres</div>
        <h2>Choisissez votre <em>formule</em></h2>
        <p>Conçues pour s&apos;adapter à chaque occasion</p>
      </div>
      <div className="formules-grid">
        <div className="formule-card">
          <FormuleImgPlaceholder label="Formule Individuelle" />
          <div className="formule-body">
            <h3>Formule Individuelle</h3>
            <p>
              Idéale pour les gîtes et particuliers. Plateau complet avec produits locaux,
              livré à votre porte.
            </p>
            <span className="formule-badge">À partir de 2 personne</span>
          </div>
        </div>
        <div className="formule-card">
          <FormuleImgPlaceholder label="Formule Groupe" />
          <div className="formule-body">
            <h3>Formule Groupe</h3>
            <p>
              Pour vos séminaires et célébrations. Buffet complet avec vaisselle en option.
            </p>
            <span className="formule-badge">Groupes &amp; entreprises</span>
          </div>
        </div>
      </div>
    </section>
  )
}
