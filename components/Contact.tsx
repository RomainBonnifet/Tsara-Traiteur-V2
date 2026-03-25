export default function Contact() {
  return (
    <section className="cta reveal" id="contact">
      <div className="cta-left">
        <div className="section-label">Contactez-nous</div>
        <h2>Réservez votre <em>petit-déjeuner</em></h2>
        <p>
          Nous nous chargeons de tout. Dites-nous simplement vos envies, le nombre de convives
          et la date.
        </p>
        <div className="cta-info">
          <a href="tel:+33540207243"><span>📞</span> 05 40 20 72 43</a>
          <a href="mailto:contact@tsara-rural.fr"><span>✉</span> contact@tsara-rural.fr</a>
          <span><span>📍</span> Saint-Médard-de-Guizières</span>
        </div>
      </div>
      <div className="cta-right">
        <div className="form-grid">
          <div className="form-row">
            <label>Prénom &amp; Nom</label>
            <input type="text" placeholder="Marie Dupont" />
          </div>
          <div className="form-row">
            <label>Téléphone</label>
            <input type="tel" placeholder="06 XX XX XX XX" />
          </div>
        </div>
        <div className="form-row">
          <label>Type de prestation</label>
          <select defaultValue="">
            <option value="" disabled>Sélectionner...</option>
            <option>Livraison à domicile</option>
            <option>Séminaire</option>
            <option>Gîte / Chambre d&apos;hôtes</option>
            <option>Autre</option>
          </select>
        </div>
        <div className="form-grid">
          <div className="form-row">
            <label>Date souhaitée</label>
            <input type="date" />
          </div>
          <div className="form-row">
            <label>Nombre de personnes</label>
            <input type="number" placeholder="4" min="1" />
          </div>
        </div>
        <div className="form-row">
          <label>Message</label>
          <textarea placeholder="Précisez vos souhaits..."></textarea>
        </div>
        <button className="btn-submit">Envoyer ma demande</button>
      </div>
    </section>
  )
}
