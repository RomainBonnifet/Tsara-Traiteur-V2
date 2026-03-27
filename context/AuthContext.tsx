"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = { id: number; email: string; role: string }

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Charge l'utilisateur courant au montage en appelant /api/auth/me
  async function fetchUser() {
    const res = await fetch("/api/auth/me")
    const data = await res.json()
    setUser(data)
    setLoading(false)
  }

  useEffect(() => { fetchUser() }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
