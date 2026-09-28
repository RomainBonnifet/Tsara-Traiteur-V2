"use client"
import Link from "next/link"
import { useEffect } from "react"
import { useCart, CLE_STOCKAGE } from "@/context/CartContext"
import { useLang } from "@/context/LangContext"

// Next transmet les paramètres d'URL à chaque page via la prop searchParams.
// Les lire ici plutôt qu'avec le hook useSearchParams() évite de devoir
// envelopper la page dans un <Suspense>, exigé par Next 14 pour ce hook.
export default function CommandeSuccesPage({
  searchParams,
}: {
  searchParams: { mode?: string }
}) {
  const { clearCart } = useCart()
  const { t } = useLang()
  const aLaLivraison = searchParams.mode === "livraison"

  // On vide le panier une fois la commande confirmée.
  // On efface localStorage directement en plus du contexte pour éviter
  // tout problème de timing entre la lecture et l'écriture au montage.
  // clearCart est stabilisé par useCallback dans CartContext :
  // l'effet ne se déclenche donc qu'une fois, au montage.
  useEffect(() => {
    // La clé était écrite en dur et pointait encore sur "tsara-cart", la
    // version d'avant le passage aux quantités. Elle n'effaçait donc plus
    // rien. On importe la constante : un futur changement de version ne
    // pourra plus laisser cette ligne en arrière.
    localStorage.removeItem(CLE_STOCKAGE)
    clearCart()
  }, [clearCart])

  return (
    <main className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
        <h1 className="auth-title">{t.succes.titre}</h1>
        <p style={{ color: "var(--brun-clair)", marginBottom: "2rem" }}>
          {aLaLivraison ? t.succes.texteARegler : t.succes.textePayee}
        </p>
        <Link href="/" className="auth-btn" style={{ display: "block" }}>
          {t.succes.retour}
        </Link>
      </div>
    </main>
  )
}
