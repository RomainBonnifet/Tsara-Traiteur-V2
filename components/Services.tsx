export default function Services() {
  return (
    <section className="services reveal" id="services">
      <div className="section-label">Ce que nous proposons</div>
      <h2>Nos <em>services</em></h2>
      <p className="services-sub">Conçus pour s&apos;adapter à chaque occasion</p>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-num">01</div>
          <h3>Livraison à domicile</h3>
          <p>Petit-déjeuner livré chez vous. Pas de courses, pas de préparation, juste le plaisir.</p>
          <span className="service-pill">En Gironde &amp; alentours</span>
        </div>
        <div className="service-card">
          <div className="service-num">02</div>
          <h3>Séminaires &amp; pro</h3>
          <p>Solution clé en main pour vos pauses professionnelles et moments de cohésion.</p>
          <span className="service-pill">Devis sur mesure</span>
        </div>
        <div className="service-card">
          <div className="service-num">03</div>
          <h3>Location de vaisselle</h3>
          <p>Pour sublimer votre buffet, location de vaisselle assortie à votre événement.</p>
          <span className="service-pill">Sur demande</span>
        </div>
      </div>
    </section>
  )
}
