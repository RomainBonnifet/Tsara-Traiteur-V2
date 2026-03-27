"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"

export default function PanierPage() {
  const { items, removeItem, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <main className="panier">
        <div className="panier-header">
          <Link href="/#formules" className="commander-back">← Retour aux formules</Link>
          <h1>Votre <em>panier</em></h1>
        </div>
        <div className="panier-empty">
          <p>Votre panier est vide.</p>
          <Link href="/#formules" className="formule-cta">Voir les formules</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="panier">
      <div className="panier-header">
        <Link href="/#formules" className="commander-back">← Retour aux formules</Link>
        <h1>Votre <em>panier</em></h1>
      </div>

      <div className="panier-body">

        {/* ── Liste des items ── */}
        <div className="panier-items">
          {items.map(item => (
            <div key={item.id} className="panier-item">

              <div className="panier-item-header">
                <div>
                  <h2>{item.formuleNom}</h2>
                  <span className="panier-item-meta">
                    {item.nbPersonnes} personne{item.nbPersonnes > 1 ? "s" : ""} · {item.formulePrix.toFixed(2)} € / pers.
                  </span>
                </div>
                <button
                  className="panier-item-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label="Supprimer"
                >✕</button>
              </div>

              {/* Sélections — une section par personne */}
              {item.selections.map((personSel, i) => (
                <div key={i} className="panier-item-details">
                  <p className="summary-section-title">
                    {item.nbPersonnes > 1 ? `Personne ${i + 1}` : "Plateau"}
                  </p>
                  {Object.values(personSel).map((sel, j) => (
                    <div key={j} className="summary-line">
                      <span>{sel.slotNom}</span>
                      <span>{sel.articleNom}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Extras */}
              {item.extras.length > 0 && (
                <div className="panier-item-details">
                  <p className="summary-section-title">Extras</p>
                  {item.extras.map(e => (
                    <div key={e.extraId} className="summary-line">
                      <span>{e.nom} × {e.quantite}</span>
                      <span>{(e.prix * e.quantite).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="panier-item-subtotal">
                <span>Sous-total</span>
                <span>{item.subtotal.toFixed(2)} €</span>
              </div>

            </div>
          ))}
        </div>

        {/* ── Récapitulatif final ── */}
        <div className="commander-summary">
          <h2>Récapitulatif</h2>

          {items.map(item => (
            <div key={item.id} className="summary-line">
              <span>Formule {item.formuleNom} × {item.nbPersonnes}</span>
              <span>{item.subtotal.toFixed(2)} €</span>
            </div>
          ))}

          <div className="summary-total">
            <div className="summary-line total">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <button
            className="summary-cta"
            disabled={loading}
            onClick={async () => {
              // Si non connecté, on redirige vers la connexion
              if (!user) {
                router.push("/connexion?redirect=/panier")
                return
              }
              setLoading(true)
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items })
              })
              const data = await res.json()
              setLoading(false)
              // Stripe nous renvoie une URL, on y redirige
              if (data.url) window.location.href = data.url
            }}
          >
            {loading ? "Chargement..." : user ? "Passer commande" : "Se connecter pour commander"}
          </button>

          <button
            className="panier-clear"
            onClick={clearCart}
          >
            Vider le panier
          </button>
        </div>

      </div>
    </main>
  )
}
