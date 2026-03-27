"use client"

// Vue d'ensemble du dashboard admin.
// On fetch les stats depuis /api/admin/stats et les 5 dernières commandes.

import { useEffect, useState } from "react"
import Link from "next/link"

// On définit les types TypeScript pour les données qu'on attend de l'API.
// Ça nous aide à éviter les fautes de frappe et à avoir l'autocomplétion.
type Stats = {
  totalCommandes: number
  chiffreAffaires: number
  commandesEnAttente: number
  commandesPayees: number
}

type Commande = {
  id: number
  date: string
  statut: string
  montantTotal: number
  nbPersonnes: number
  user: { email: string }
  formule: { nom: string }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On lance les deux fetch en parallèle avec Promise.all
    // C'est plus rapide que de les faire l'un après l'autre
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/commandes").then((r) => r.json()),
    ])
      .then(([statsData, commandesData]) => {
        setStats(statsData)
        // On garde seulement les 5 premières (déjà triées par date desc côté API)
        setCommandes(commandesData.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="dash-loading">Chargement...</div>

  return (
    <div>
      <h1 className="dash-title">Vue d&apos;ensemble</h1>

      {/* Grille des 4 cartes de statistiques */}
      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-value">{stats?.totalCommandes ?? 0}</div>
          <div className="dash-card-label">Total commandes</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-value">
            {(stats?.chiffreAffaires ?? 0).toFixed(2)} €
          </div>
          <div className="dash-card-label">Chiffre d&apos;affaires</div>
        </div>
        <div className="dash-card dash-card-attente">
          <div className="dash-card-value">{stats?.commandesEnAttente ?? 0}</div>
          <div className="dash-card-label">En attente</div>
        </div>
        <div className="dash-card dash-card-payee">
          <div className="dash-card-value">{stats?.commandesPayees ?? 0}</div>
          <div className="dash-card-label">Payées</div>
        </div>
      </div>

      {/* Liste des 5 dernières commandes */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-subtitle">Dernières commandes</h2>
          <Link href="/dashboard/commandes" className="dash-btn dash-btn-sm">
            Voir toutes
          </Link>
        </div>

        {commandes.length === 0 ? (
          <p className="dash-empty">Aucune commande pour le moment.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Client</th>
                <th>Formule</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{new Date(c.date).toLocaleDateString("fr-FR")}</td>
                  <td>{c.user.email}</td>
                  <td>{c.formule.nom}</td>
                  <td>{c.montantTotal.toFixed(2)} €</td>
                  <td>
                    <span className={`badge badge-${c.statut}`}>{c.statut.replace("_", " ")}</span>
                  </td>
                  <td>
                    <Link href={`/dashboard/commandes/${c.id}`} className="dash-btn dash-btn-sm">
                      Détail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
