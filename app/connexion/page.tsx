"use client"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function ConnexionForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Si l'utilisateur vient de s'inscrire, on affiche un message de confirmation
  const justRegistered = searchParams.get("registered") === "1"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    // Connexion réussie → rechargement complet pour que l'AuthContext
    // refasse son fetchUser et mette à jour la nav
    const redirect = searchParams.get("redirect") || "/"
    window.location.href = redirect
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Se connecter</h1>

        {justRegistered && (
          <p className="auth-success">Compte créé avec succès ! Connectez-vous.</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ? <Link href="/inscription">S&apos;inscrire</Link>
        </p>
      </div>
    </main>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  )
}
