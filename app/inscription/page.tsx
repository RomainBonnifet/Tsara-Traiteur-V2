"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLang } from "@/context/LangContext"

export default function InscriptionPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { t } = useLang()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/register", {
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

    // Inscription réussie → on redirige vers la connexion
    router.push("/connexion?registered=1")
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{t.auth.inscriptionTitre}</h1>

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
              placeholder={t.auth.motDePassePlaceholder}
              minLength={8}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? t.auth.inscriptionEnCours : t.auth.creerMonCompte}
          </button>
        </form>

        <p className="auth-switch">
          {t.auth.dejaUnCompte} <Link href="/connexion">{t.auth.connexionTitre}</Link>
        </p>
      </div>
    </main>
  )
}
