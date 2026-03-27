"use client"
import { createContext, useContext, useState, useEffect } from "react"

// ── Types ──────────────────────────────────────────────────────────────────

// Un article choisi pour un slot (on stocke les labels pour l'affichage + l'id pour la DB)
export type SelectionDetail = { slotNom: string; articleNom: string; articleId: number }

// Un extra ajouté avec sa quantité
type ExtraDetail = { extraId: number; nom: string; prix: number; quantite: number }

// Un item du panier = une formule configurée
export type CartItem = {
  id: string               // identifiant unique généré à l'ajout
  formuleId: number
  formuleNom: string
  formulePrix: number
  nbPersonnes: number
  isGroupe: boolean
  selections: Array<Record<number, SelectionDetail>>  // [personne0: { slotId → détail }, personne1: ...]
  extras: ExtraDetail[]
  subtotal: number
}

// Ce que le contexte expose à tous les composants
type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: number   // somme de tous les subtotals
  count: number   // nombre d'items dans le panier
}

// ── Création du contexte ───────────────────────────────────────────────────

// createContext crée un "tuyau" qui permet de passer des données
// à tous les composants enfants sans les passer manuellement prop par prop
const CartContext = createContext<CartContextType | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────

// Le Provider est le composant qui enveloppe l'appli et fournit le contexte.
// Tout composant enfant peut y accéder via useCart().
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Au montage : on recharge le panier depuis localStorage s'il existe
  useEffect(() => {
    const saved = localStorage.getItem("tsara-cart")
    if (saved) setItems(JSON.parse(saved))
    setLoaded(true)
  }, [])

  // À chaque changement du panier : on sauvegarde dans localStorage
  // Le flag "loaded" empêche d'écraser le localStorage avant d'avoir lu
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem("tsara-cart", JSON.stringify(items))
  }, [items, loaded])

  function addItem(item: Omit<CartItem, "id">) {
    // crypto.randomUUID() génère un identifiant unique garanti
    const newItem: CartItem = { ...item, id: crypto.randomUUID() }
    setItems(prev => [...prev, newItem])
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  function clearCart() {
    setItems([])
  }

  // États dérivés
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────

// useCart() est un hook personnalisé : il encapsule useContext
// pour qu'on puisse juste écrire const { items } = useCart() partout
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider")
  return ctx
}
