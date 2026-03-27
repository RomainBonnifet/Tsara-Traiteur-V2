"use client"
import Link from "next/link"
import { useEffect } from "react"
import { useCart } from "@/context/CartContext"

export default function CommandeSuccesPage() {
  const { clearCart } = useCart()

  // On vide le panier une fois le paiement confirmé
  // On efface localStorage directement en plus du contexte pour éviter
  // tout problème de timing entre la lecture et l'écriture au montage
  useEffect(() => {
    localStorage.removeItem("tsara-cart")
    clearCart()
  }, [])

  return (
    <main className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
        <h1 className="auth-title">Commande confirmée !</h1>
        <p style={{ color: "var(--brun-clair)", marginBottom: "2rem" }}>
          Merci pour votre commande. Vous recevrez une confirmation par email.
        </p>
        <Link href="/" className="auth-btn" style={{ display: "block" }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
