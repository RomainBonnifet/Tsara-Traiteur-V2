"use client"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"

// ── Types ──────────────────────────────────────────────────────────────────

// Une ligne de répartition : « pour le créneau Boissons chaudes, 12 cafés ».
// On stocke les libellés pour l'affichage et les ids pour la base.
//
// C'est le changement de modèle : avant, une composition complète par
// personne (« personne 1 : café + croissant »). Le client ne décide plus
// panier par panier, il répartit des quantités dans chaque créneau.
export type LigneSelection = {
  slotId: number
  slotNom: string
  articleId: number
  articleNom: string
  quantite: number
}

// Un extra ajouté avec sa quantité
type ExtraDetail = { extraId: number; nom: string; prix: number; quantite: number }

// Un item du panier = une formule configurée
export type CartItem = {
  id: string               // identifiant unique généré à l'ajout
  formuleId: number
  formuleNom: string
  formulePrix: number
  nbPersonnes: number
  // Unité de vente recopiée depuis la formule au moment de l'ajout : le
  // panier doit pouvoir s'afficher sans réinterroger l'API.
  unite: string
  // Catégorie de la formule, recopiée à l'ajout. C'est elle qui détermine
  // les créneaux de livraison proposés : le matin pour un petit-déjeuner,
  // le soir pour un plateau apéro. Un panier mixte demandera donc deux
  // créneaux, un par catégorie.
  categorieId: number
  categorieNom: string
  // Créneaux autorisés pour cette catégorie, recopiés comme l'unité : la
  // page panier s'affiche sans réinterroger l'API. /api/checkout les relit
  // en base de toute façon, une liste périmée sera donc refusée.
  creneaux: string[]
  lignes: LigneSelection[]
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

// Le suffixe -v2 date du passage aux quantités. Les paniers enregistrés avant
// ce changement contiennent un champ "selections" que le code actuel ne sait
// plus lire : la page panier planterait au rechargement. Changer de clé les
// rend simplement invisibles, sans code de conversion à écrire pour des
// paniers qui ne valent de toute façon plus rien.
//
// Déclarée hors du composant : une constante déclarée à l'intérieur serait
// recréée à chaque rendu, et la règle exhaustive-deps d'ESLint exigerait
// alors de la mettre en dépendance des effets qui l'utilisent.
// v3 : les articles du panier portent désormais leur catégorie et ses
// créneaux. Un panier enregistré en v2 n'a ni l'une ni les autres, et la
// page panier ne saurait pas quel créneau lui proposer. Changer de clé le
// rend invisible plutôt que d'écrire du code de conversion pour des paniers
// qui ne valent de toute façon plus rien.
export const CLE_STOCKAGE = "tsara-cart-v3"

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
    // localStorage peut être inaccessible (navigation privée, cookies
    // bloqués) et son contenu peut avoir été modifié à la main : un JSON
    // illisible ne doit pas empêcher le site de s'afficher.
    try {
      const saved = localStorage.getItem(CLE_STOCKAGE)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setItems(parsed)
      }
      localStorage.removeItem("tsara-cart")
      localStorage.removeItem("tsara-cart-v2")
    } catch {
      // Panier ignoré : on repart d'un panier vide.
    }
    setLoaded(true)
  }, [])

  // À chaque changement du panier : on sauvegarde dans localStorage
  // Le flag "loaded" empêche d'écraser le localStorage avant d'avoir lu
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(items))
    } catch {
      // Stockage plein ou indisponible : le panier reste valable en mémoire
      // pour la session en cours, il ne survivra simplement pas au rechargement.
    }
  }, [items, loaded])

  // useCallback mémorise la fonction : React renvoie LA MÊME référence
  // d'un rendu à l'autre, au lieu d'en recréer une neuve à chaque fois.
  // C'est indispensable pour que ces fonctions puissent figurer dans le
  // tableau de dépendances d'un useEffect sans le relancer en boucle.
  //
  // Le tableau de dépendances est vide car on n'utilise que setItems, dont
  // React garantit l'identité stable, et la forme "prev => ..." qui lit
  // l'état précédent sans avoir besoin de le capturer depuis l'extérieur.
  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    // crypto.randomUUID() génère un identifiant unique garanti
    const newItem: CartItem = { ...item, id: crypto.randomUUID() }
    setItems(prev => [...prev, newItem])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // États dérivés
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items]
  )
  const count = items.length

  // Même logique pour l'objet de contexte lui-même : écrit en ligne dans
  // value={{ ... }}, il était recréé à chaque rendu du Provider, ce qui
  // forçait TOUS les composants abonnés à se re-rendre, même quand rien
  // n'avait changé.
  const value = useMemo(
    () => ({ items, addItem, removeItem, clearCart, total, count }),
    [items, addItem, removeItem, clearCart, total, count]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ── Hook ───────────────────────────────────────────────────────────────────

// useCart() est un hook personnalisé : il encapsule useContext
// pour qu'on puisse juste écrire const { items } = useCart() partout
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider")
  return ctx
}
