"use client"

// Liste de toutes les commandes pour l'admin.
// Affiche un tableau avec les informations essentielles et des liens vers le détail.

import { useEffect, useState } from "react"
import Link from "next/link"

type Commande = {
  id: number
  date: string
  statut: string
  montantTotal: number
  nbPersonnes: number
  user: { email: string }
  formule: { nom: string }
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/commandes")
      .then((r) => r.json())
      .then(setCommandes)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="dash-loading">Chargement...</div>

  return (
    <div>
      <h1 className="dash-title">Commandes</h1>

      {commandes.length === 0 ? (
        <p className="dash-empty">Aucune commande pour le moment.</p>
      ) : (
        <div className="dash-table-wrapper">
          <table className="dash-table commandes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Client</th>
                <th>Formule</th>
                <th>Nb personnes</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>
                    {new Date(c.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td><span className="cell-truncate">{c.user.email}</span></td>
                  <td>{c.formule.nom}</td>
                  <td>{c.nbPersonnes}</td>
                  <td>{c.montantTotal.toFixed(2)} €</td>
                  <td>
                    {/* Le badge change de couleur selon le statut */}
                    <span className={`badge badge-${c.statut}`}>
                      {c.statut.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/commandes/${c.id}`}
                      className="dash-btn dash-btn-sm"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
