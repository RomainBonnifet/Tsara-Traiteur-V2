"use client"

import { useState } from "react"

export default function Contact() {
  const [form, setForm] = useState({
    nom: "", telephone: "", prestation: "", date: "", nbPersonnes: "", message: ""
  })
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "error">("idle")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatut("loading")

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setStatut(res.ok ? "ok" : "error")
  }

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
        {statut === "ok" ? (
          <div className="contact-success">
            <p>✓ Votre demande a bien été envoyée !</p>
            <p>Nous vous recontacterons très prochainement.</p>
            <button className="btn-submit" onClick={() => setStatut("idle")}>
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-row">
                <label>Prénom &amp; Nom</label>
                <input
                  type="text" name="nom" placeholder="Marie Dupont"
                  value={form.nom} onChange={handleChange} required
                />
              </div>
              <div className="form-row">
                <label>Téléphone</label>
                <input
                  type="tel" name="telephone" placeholder="06 XX XX XX XX"
                  value={form.telephone} onChange={handleChange} required
                />
              </div>
            </div>
            <div className="form-row">
              <label>Type de prestation</label>
              <select name="prestation" value={form.prestation} onChange={handleChange}>
                <option value="">Sélectionner...</option>
                <option>Livraison à domicile</option>
                <option>Séminaire</option>
                <option>Gîte / Chambre d&apos;hôtes</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>Date souhaitée</label>
                <input
                  type="date" name="date"
                  value={form.date} onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>Nombre de personnes</label>
                <input
                  type="number" name="nbPersonnes" placeholder="4" min="1"
                  value={form.nbPersonnes} onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <label>Message</label>
              <textarea
                name="message" placeholder="Précisez vos souhaits..."
                value={form.message} onChange={handleChange}
              />
            </div>
            {statut === "error" && (
              <p className="contact-error">Une erreur est survenue, veuillez réessayer.</p>
            )}
            <button className="btn-submit" type="submit" disabled={statut === "loading"}>
              {statut === "loading" ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
