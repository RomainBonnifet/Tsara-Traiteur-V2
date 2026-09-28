"use client"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import fr from "@/lib/i18n/fr"
import en from "@/lib/i18n/en"
import { COOKIE_LANGUE, LANGUE_DEFAUT, type Langue } from "@/lib/i18n/config"
import type { Dictionnaire } from "@/lib/i18n/fr"

const DICTIONNAIRES: Record<Langue, Dictionnaire> = { fr, en }

type LangContextType = {
  langue: Langue
  setLangue: (l: Langue) => void
  // Le dictionnaire de la langue courante. Nommé « t » par convention
  // (translations), pour que le JSX reste lisible : t.nav.contact.
  t: Dictionnaire
}

const LangContext = createContext<LangContextType | null>(null)

// La langue initiale vient du SERVEUR (cookie lu dans app/layout.tsx).
//
// C'est ce qui évite le clignotement : sans elle, le premier rendu serait en
// français et basculerait en anglais une fois le cookie lu côté navigateur.
// Le visiteur anglophone verrait la page changer sous ses yeux à chaque
// chargement.
export function LangProvider({
  initiale,
  children,
}: {
  initiale: Langue
  children: React.ReactNode
}) {
  const [langue, setLangueState] = useState<Langue>(initiale)

  const setLangue = useCallback((l: Langue) => {
    setLangueState(l)

    // Le cookie sert au rendu serveur du PROCHAIN chargement.
    // max-age = 1 an ; SameSite=Lax suffit : ce n'est pas une donnée
    // sensible, et le cookie doit survivre à un retour depuis Stripe.
    document.cookie = `${COOKIE_LANGUE}=${l};path=/;max-age=31536000;SameSite=Lax`

    // L'attribut lang de <html> doit suivre : les lecteurs d'écran s'en
    // servent pour choisir la prononciation, et les navigateurs pour
    // proposer (ou non) leur traduction automatique.
    document.documentElement.lang = l
  }, [])

  const value = useMemo(
    () => ({ langue, setLangue, t: DICTIONNAIRES[langue] ?? DICTIONNAIRES[LANGUE_DEFAUT] }),
    [langue, setLangue]
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// Hook d'accès. Volontairement court : il apparaît dans chaque composant
// traduit, const { t } = useLang().
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang doit être utilisé dans un LangProvider")
  return ctx
}
