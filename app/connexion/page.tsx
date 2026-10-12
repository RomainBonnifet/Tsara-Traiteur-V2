"use client"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useLang } from "@/context/LangContext"

function ConnexionForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { t } = useLang()

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
        <h1 className="auth-title">{t.auth.connexionTitre}</h1>

        {justRegistered && (
          <p className="auth-success">{t.auth.compteCree}</p>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">{t.auth.email}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={t.auth.emailPlaceholder}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">{t.auth.motDePasse}</label>
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
            {loading ? t.auth.connexionEnCours : t.auth.connexionTitre}
          </button>
        </form>

        <p className="auth-switch">
          {t.auth.pasDeCompte} <Link href="/inscription">{t.auth.sInscrire}</Link>
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
