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
  const CRENEAUX = ["7h30 – 8h30", "8h30 – 9h30", "9h30 – 10h30", "10h30 – 11h30"]

  const [livraison, setLivraison] = useState({ telephone: "", date: "", adresse: "", creneau: "" })
  const [adresseStatut, setAdresseStatut] = useState<"idle" | "checking" | "ok" | "error">("idle")
  const [adresseMessage, setAdresseMessage] = useState("")

  const hasIndividuel = items.every(item => !item.isGroupe)

  const livraisonValide =
    livraison.telephone.trim() !== "" &&
    livraison.date !== "" &&
    livraison.creneau !== "" &&
    (hasIndividuel ? adresseStatut === "ok" : livraison.adresse.trim() !== "")

  async function validerAdresse() {
    if (!livraison.adresse.trim()) return
    setAdresseStatut("checking")
    setAdresseMessage("")
    const res = await fetch("/api/validate-adresse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adresse: livraison.adresse }),
    })
    const data = await res.json()
    if (data.ok) {
      setAdresseStatut("ok")
      setAdresseMessage(`✓ ${data.label}`)
    } else {
      setAdresseStatut("error")
      setAdresseMessage(data.message)
    }
  }

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
                    {item.nbPersonnes > 1 ? `Personne ${i + 1}` : "Panier"}
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

          {/* ── Infos de livraison ── */}
          <div className="livraison-form">
            <h3 className="livraison-title">Informations de livraison</h3>
            <div className="livraison-field">
              <label className="livraison-label">Téléphone</label>
              <input
                className="livraison-input"
                type="tel"
                placeholder="06 12 34 56 78"
                value={livraison.telephone}
                onChange={e => setLivraison({ ...livraison, telephone: e.target.value })}
              />
            </div>
            <div className="livraison-field">
              <label className="livraison-label">Date de livraison</label>
              <input
                className="livraison-input"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={livraison.date}
                onChange={e => setLivraison({ ...livraison, date: e.target.value })}
              />
            </div>
            <div className="livraison-field">
              <label className="livraison-label">Créneau de livraison</label>
              <select
                className="livraison-input"
                value={livraison.creneau}
                onChange={e => setLivraison({ ...livraison, creneau: e.target.value })}
              >
                <option value="">-- Choisir un créneau --</option>
                {CRENEAUX.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="livraison-field">
              <label className="livraison-label">Adresse de livraison</label>
              <input
                className={`livraison-input ${adresseStatut === "ok" ? "livraison-input-ok" : adresseStatut === "error" ? "livraison-input-error" : ""}`}
                type="text"
                placeholder="12 rue des Fleurs, 33000 Bordeaux"
                value={livraison.adresse}
                onChange={e => {
                  setLivraison({ ...livraison, adresse: e.target.value })
                  setAdresseStatut("idle")
                  setAdresseMessage("")
                }}
                onBlur={hasIndividuel ? validerAdresse : undefined}
              />
              {hasIndividuel && adresseStatut === "checking" && (
                <span className="livraison-hint">Vérification en cours...</span>
              )}
              {hasIndividuel && adresseMessage && (
                <span className={`livraison-hint ${adresseStatut === "ok" ? "livraison-hint-ok" : "livraison-hint-error"}`}>
                  {adresseMessage}
                </span>
              )}
            </div>
          </div>

          <button
            className="summary-cta"
            disabled={loading || (!!user && !livraisonValide)}
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
                body: JSON.stringify({ items, livraison })
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
