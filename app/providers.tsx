"use client"
import { CartProvider } from "@/context/CartContext"
import { AuthProvider } from "@/context/AuthContext"

// Ce composant existe uniquement pour envelopper l'appli avec les providers.
// layout.tsx ne peut pas être "use client" (il exporte metadata),
// donc on délègue cette partie à un composant client séparé.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
