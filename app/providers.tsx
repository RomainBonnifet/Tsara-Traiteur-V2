"use client"
import { CartProvider } from "@/context/CartContext"
import { AuthProvider } from "@/context/AuthContext"
import { LangProvider } from "@/context/LangContext"
import { ReglagesProvider } from "@/context/ReglagesContext"
import type { Langue } from "@/lib/i18n/config"
import type { Reglages } from "@/lib/reglages"

// Ce composant existe uniquement pour envelopper l'appli avec les providers.
// layout.tsx ne peut pas être "use client" (il exporte metadata),
// donc on délègue cette partie à un composant client séparé.
// langue : lue dans le cookie par layout.tsx, cote SERVEUR. Elle traverse
// ce composant client pour atteindre LangProvider, qui en fait son etat
// initial. C est ce qui permet au premier rendu d etre deja dans la bonne
// langue, sans clignotement.
export default function Providers({
  langue,
  reglages,
  children,
}: {
  langue: Langue
  reglages: Reglages
  children: React.ReactNode
}) {
  return (
    <LangProvider initiale={langue}>
      <ReglagesProvider valeurs={reglages}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </ReglagesProvider>
    </LangProvider>
  )
}
