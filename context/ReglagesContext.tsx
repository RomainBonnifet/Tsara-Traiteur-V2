"use client"
import { createContext, useContext } from "react"
import type { Reglages } from "@/lib/reglages"

// Les réglages du site, lus en base par app/layout.tsx et distribués ici.
//
// Pas d'état, pas de fetch : ce sont des valeurs figées pour la durée du
// rendu. Un contexte sert uniquement à éviter de les passer en props à
// travers toute l'arborescence.
//
// Conséquence à connaître : basculer les commandes depuis le dashboard ne
// change rien aux onglets déjà ouverts tant qu'ils ne sont pas rechargés.
// C'est acceptable — /api/checkout relit la base à chaque commande, donc un
// onglet périmé affichera un bouton actif mais sera refusé à la validation.
const ReglagesContext = createContext<Reglages | null>(null)

export function ReglagesProvider({
  valeurs,
  children,
}: {
  valeurs: Reglages
  children: React.ReactNode
}) {
  return <ReglagesContext.Provider value={valeurs}>{children}</ReglagesContext.Provider>
}

export function useReglages() {
  const ctx = useContext(ReglagesContext)
  if (!ctx) throw new Error("useReglages doit être utilisé dans un ReglagesProvider")
  return ctx
}
