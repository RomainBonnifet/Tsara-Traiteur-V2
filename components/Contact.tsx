"use client"

import { useState } from "react"
import { useLang } from "@/context/LangContext"

export default function Contact() {
  const [form, setForm] = useState({
    nom: "", telephone: "", email: "", prestation: "", date: "", nbPersonnes: "", message: ""
  })
  const [statut, setStatut] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const { t } = useLang()

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
        <div className="section-label">{t.contact.label}</div>
        <h2>{t.contact.titre} <em>{t.contact.titreEm}</em></h2>
        <p>{t.contact.texte}</p>
        <div className="cta-info">
          <a href="tel:+33540207243"><span>📞</span> 05 40 20 72 43</a>
          <a href="mailto:contact@tsara-rural.fr"><span>✉</span> contact@tsara-rural.fr</a>
          <span><span>📍</span> Saint-Médard-de-Guizières</span>
        </div>
      </div>
      <div className="cta-right">
        {statut === "ok" ? (
          <div className="contact-success">
            <p>{t.contact.succes}</p>
            <p>{t.contact.succesSuite}</p>
            <button className="btn-submit" onClick={() => setStatut("idle")}>
              {t.contact.nouvelleDemande}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-row">
                <label>{t.contact.nom}</label>
                <input
                  type="text" name="nom" placeholder={t.contact.nomPlaceholder}
                  value={form.nom} onChange={handleChange} required
                />
              </div>
              <div className="form-row">
                <label>{t.contact.telephone}</label>
                <input
                  type="tel" name="telephone" placeholder={t.contact.telephonePlaceholder}
                  value={form.telephone} onChange={handleChange} required
                />
              </div>
            </div>
            <div className="form-row">
              <label>{t.contact.email}</label>
              <input
                type="email" name="email" placeholder={t.contact.emailPlaceholder}
                value={form.email} onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <label>{t.contact.prestation}</label>
              {/* value explicite sur chaque option : sans lui, le navigateur
                  enverrait le LIBELLE TRADUIT au serveur, et le traiteur
                  recevrait « Seminar » dans un email francais. La valeur
                  reste donc en francais, seul l’affichage change. */}
              <select name="prestation" value={form.prestation} onChange={handleChange}>
                <option value="">{t.contact.prestationVide}</option>
                <option value="Livraison à domicile">{t.contact.prestation1}</option>
                <option value="Séminaire">{t.contact.prestation2}</option>
                <option value="Gîte / Chambre d’hôtes">{t.contact.prestation3}</option>
                <option value="Autre">{t.contact.prestation4}</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>{t.contact.date}</label>
                <input
                  type="date" name="date"
                  value={form.date} onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>{t.contact.nbPersonnes}</label>
                <input
                  type="number" name="nbPersonnes" placeholder="4" min="1"
                  value={form.nbPersonnes} onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <label>{t.contact.message}</label>
              <textarea
                name="message" placeholder={t.contact.messagePlaceholder}
                value={form.message} onChange={handleChange}
              />
            </div>
            {statut === "error" && (
              <p className="contact-error">{t.contact.erreur}</p>
            )}
            <button className="btn-submit" type="submit" disabled={statut === "loading"}>
              {statut === "loading" ? t.contact.envoiEnCours : t.contact.envoyer}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
