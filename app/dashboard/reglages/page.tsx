"use client"

// Réglages du site.
//
// Pour l'instant un seul : la suspension des commandes, pendant les congés
// ou une absence. La page est construite pour en accueillir d'autres.

import { useEffect, useState } from "react"

type Reglages = {
  commandesOuvertes: boolean
  messagePause: string | null
  updatedAt: string
}

export default function ReglagesPage() {
  const [reglages, setReglages] = useState<Reglages | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [info, setInfo] = useState("")

  useEffect(() => {
    fetch("/api/admin/reglages")
      .then((r) => r.json())
      .then((data: Reglages) => {
        setReglages(data)
        setMessage(data.messagePause ?? "")
      })
      .finally(() => setLoading(false))
  }, [])

  function afficherInfo(texte: string) {
    setInfo(texte)
    setTimeout(() => setInfo(""), 4000)
  }

  async function enregistrer(modifications: Partial<Reglages>) {
    setSaving(true)
    const res = await fetch("/api/admin/reglages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modifications),
    })
    if (res.ok) {
      const maj: Reglages = await res.json()
      setReglages(maj)
      setMessage(maj.messagePause ?? "")
      afficherInfo(
        maj.commandesOuvertes
          ? "Commandes rouvertes."
          : "Commandes suspendues. Le site reste consultable."
      )
    } else {
      afficherInfo("Erreur lors de l'enregistrement.")
    }
    setSaving(false)
  }

  function basculer() {
    if (!reglages) return

    // Suspendre coupe le chiffre d'affaires en ligne : ça se confirme.
    // Rouvrir, non — c'est le retour à la normale.
    if (reglages.commandesOuvertes) {
      const ok = confirm(
        "Suspendre les commandes en ligne ?\n\n" +
        "Le site restera consultable : les visiteurs verront vos formules et " +
        "pourront vous écrire par le formulaire de contact.\n\n" +
        "Seul le passage de commande sera bloqué, jusqu'à ce que vous le " +
        "réactiviez ici."
      )
      if (!ok) return
    }
    enregistrer({ commandesOuvertes: !reglages.commandesOuvertes, messagePause: message })
  }

  if (loading) return <div className="dash-loading">Chargement...</div>
  if (!reglages) return <div className="dash-loading">Réglages introuvables.</div>

  return (
    <div>
      <h1 className="dash-title">Réglages</h1>
      {info && <p className="dash-message">{info}</p>}

      <div className="dash-detail-card">
        <h2 className="dash-subtitle">Commandes en ligne</h2>

        <div className="reglage-etat">
          <span
            className={`badge ${reglages.commandesOuvertes ? "badge-payee" : "badge-annulee"}`}
          >
            {reglages.commandesOuvertes ? "Ouvertes" : "Suspendues"}
          </span>
          <button className="dash-btn" onClick={basculer} disabled={saving}>
            {saving
              ? "Enregistrement..."
              : reglages.commandesOuvertes
                ? "Suspendre les commandes"
                : "Rouvrir les commandes"}
          </button>
        </div>

        <p className="dash-aide">
          {reglages.commandesOuvertes
            ? "Vos clients peuvent commander et payer normalement."
            : "Vos formules restent visibles et le formulaire de contact fonctionne. Seul le passage de commande est bloqué."}
        </p>

        <div className="dash-field" style={{ marginTop: "1.5rem" }}>
          <label className="dash-label" htmlFor="message-pause">
            Mot affiché aux visiteurs pendant la suspension
          </label>
          <input
            id="message-pause"
            className="dash-input"
            maxLength={200}
            placeholder="Ex : De retour le 20 août, merci de votre patience !"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <span className="dash-aide">
            Facultatif. Il s&apos;affiche dans le bandeau, sous le titre
            « Commandes en ligne suspendues ».{" "}
            {/* Le traiteur ne peut pas deviner que le site est bilingue :
                on le lui dit là où il saisit le texte. */}
            Ce texte n&apos;est pas traduit : il apparaîtra tel quel, y
            compris pour les visiteurs anglophones.
          </span>
        </div>

        <button
          className="dash-btn dash-btn-neutral"
          disabled={saving || message === (reglages.messagePause ?? "")}
          onClick={() => enregistrer({ messagePause: message })}
        >
          Enregistrer le message
        </button>
      </div>
    </div>
  )
}
