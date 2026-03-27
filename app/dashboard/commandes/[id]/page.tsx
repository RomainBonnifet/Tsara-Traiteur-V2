"use client"

// Page de détail d'une commande.
// Affiche toutes les infos et permet de changer le statut.

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

type OrderItem = {
  id: number
  slot: { nom: string }
  article: { nom: string }
}

type OrderExtra = {
  id: number
  quantite: number
  extra: { nom: string; prix: number }
}

type Commande = {
  id: number
  date: string
  statut: string
  montantTotal: number
  nbPersonnes: number
  user: { email: string }
  formule: { nom: string; prix: number }
  items: OrderItem[]
  extras: OrderExtra[]
}

const STATUTS = ["en_attente", "payee", "annulee"]

export default function CommandeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [commande, setCommande] = useState<Commande | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatut, setNewStatut] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch(`/api/admin/commandes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCommande(data)
        setNewStatut(data.statut)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatutUpdate() {
    if (!commande || newStatut === commande.statut) return
    setSaving(true)
    setMessage("")

    const res = await fetch(`/api/admin/commandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: newStatut }),
    })

    if (res.ok) {
      const updated = await res.json()
      setCommande({ ...commande, statut: updated.statut })
      setMessage("Statut mis à jour avec succès.")
    } else {
      setMessage("Erreur lors de la mise à jour.")
    }

    setSaving(false)
  }

  if (loading) return <div className="dash-loading">Chargement...</div>
  if (!commande) return <div className="dash-loading">Commande introuvable.</div>

  return (
    <div>
      <div className="dash-back">
        <Link href="/dashboard/commandes" className="dash-btn dash-btn-sm">
          ← Retour aux commandes
        </Link>
      </div>

      <h1 className="dash-title">Commande #{commande.id}</h1>

      {/* Bloc d'informations générales */}
      <div className="dash-detail-grid">
        <div className="dash-detail-card">
          <h2 className="dash-subtitle">Informations</h2>
          <dl className="dash-dl">
            <dt>Date</dt>
            <dd>
              {new Date(commande.date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </dd>
            <dt>Client</dt>
            <dd>{commande.user.email}</dd>
            <dt>Formule</dt>
            <dd>{commande.formule.nom}</dd>
            <dt>Nb personnes</dt>
            <dd>{commande.nbPersonnes}</dd>
            <dt>Montant total</dt>
            <dd>{commande.montantTotal.toFixed(2)} €</dd>
            <dt>Statut actuel</dt>
            <dd>
              <span className={`badge badge-${commande.statut}`}>
                {commande.statut.replace("_", " ")}
              </span>
            </dd>
          </dl>
        </div>

        {/* Bloc de mise à jour du statut */}
        <div className="dash-detail-card">
          <h2 className="dash-subtitle">Modifier le statut</h2>
          <div className="dash-field">
            <label className="dash-label" htmlFor="statut">
              Nouveau statut
            </label>
            <select
              id="statut"
              className="dash-input"
              value={newStatut}
              onChange={(e) => setNewStatut(e.target.value)}
            >
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <button
            className="dash-btn"
            onClick={handleStatutUpdate}
            disabled={saving || newStatut === commande.statut}
          >
            {saving ? "Enregistrement..." : "Mettre à jour"}
          </button>
          {message && <p className="dash-message">{message}</p>}
        </div>
      </div>

      {/* Détail des articles sélectionnés */}
      {commande.items.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-subtitle">Sélections</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Slot (catégorie)</th>
                <th>Article choisi</th>
              </tr>
            </thead>
            <tbody>
              {commande.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.slot.nom}</td>
                  <td>{item.article.nom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Extras commandés */}
      {commande.extras.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-subtitle">Extras</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Extra</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {commande.extras.map((oe) => (
                <tr key={oe.id}>
                  <td>{oe.extra.nom}</td>
                  <td>{oe.quantite}</td>
                  <td>{oe.extra.prix.toFixed(2)} €</td>
                  <td>{(oe.extra.prix * oe.quantite).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
