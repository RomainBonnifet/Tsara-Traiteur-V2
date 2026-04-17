export default function Services() {
  return (
    <section className="services reveal" id="services">
      <div className="section-label">Ce que nous proposons</div>
      <h2>Nos <em>services</em></h2>
      <p className="services-sub">Conçus pour s&apos;adapter à chaque occasion</p>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-num">01</div>
          <h3>Livraison de petits-déjeuners</h3>
          <p>Nous assurons la livraison dans toute la Gironde. Nous nous adaptons à vos horaires et au lieu de livraison pour vous offrir un service flexible et sur mesure</p>
          <span className="service-pill">Rayon de 20km autour de Coutras</span>
        </div>
        <div className="service-card">
          <div className="service-num">02</div>
          <h3>Service Traiteur</h3>
          <p>Nous prenons en charge l'installation des buffets, la mise en place ainsi que le service, afin que vous puissiez profiter pleinement de vos invités</p>
          <span className="service-pill">Dans toute la région</span>
        </div>
        <div className="service-card">
          <div className="service-num">03</div>
          <h3>Location de vaisselles</h3>
          <p>Vous manquez de vaisselle ou de matériel pour votre réception ? <br />Nous proposons un service de location avec livraison et installation directement sur le lieu de l'événement.</p>
          <span className="service-pill">Sur demande</span>
        </div>
      </div>
    </section>
  )
}
