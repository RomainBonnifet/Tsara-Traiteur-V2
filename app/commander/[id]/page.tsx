"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"

// --- Types ---
type Article     = { id: number; nom: string }
type SlotArticle = { article: Article }
type Slot        = { id: number; nom: string; articles: SlotArticle[] }
type Categorie   = { id: number; nom: string }
type Formule     = { id: number; nom: string; prix: number; categorie: Categorie; slots: Slot[] }
type Extra       = { id: number; nom: string; prix: number }

export default function CommanderPage() {
  const { id }      = useParams()
  const router      = useRouter()
  const { addItem } = useCart()

  const [formule, setFormule] = useState<Formule | null>(null)
  const [extras, setExtras]   = useState<Extra[]>([])
  const [toast, setToast]     = useState(false)

  // ── État commun ──
  // Pour INDIVIDUEL : un dict par personne → [{ slotId: articleId }, { slotId: articleId }]
  // Pour GROUPE     : toujours un seul dict → [{ slotId: articleId }]
  const [selections, setSelections]     = useState<Array<Record<number, number>>>([{}])
  const [activePersonne, setActivePersonne] = useState(0)

  // Pour GROUPE uniquement : nombre de plateaux commandés (découplé des sélections)
  const [nbGroupePersonnes, setNbGroupePersonnes] = useState(10)

  const [extraQty, setExtraQty] = useState<Record<number, number>>({})

  useEffect(() => {
    fetch(`/api/formules/${id}`)
      .then(res => res.json())
      .then(data => setFormule(data))
    fetch("/api/extras")
      .then(res => res.json())
      .then(data => setExtras(data))
  }, [id])

  // true si la formule appartient à la catégorie "Groupe"
  const isGroupe = formule?.categorie.nom === "Groupe"

  // Le vrai nbPersonnes selon le mode
  const nbPersonnes = isGroupe ? nbGroupePersonnes : selections.length

  // ── Fonctions de sélection ──

  // INDIVIDUEL : ajoute / retire un onglet personne
  function changeNbPersonnes(delta: number) {
    setSelections(prev => {
      const next = Math.max(1, prev.length + delta)
      if (next > prev.length) {
        return [...prev, ...Array(next - prev.length).fill({})]
      } else {
        setActivePersonne(curr => Math.min(curr, next - 1))
        return prev.slice(0, next)
      }
    })
  }

  // INDIVIDUEL : sélectionne un article pour la personne active
  function selectArticleIndividuel(slotId: number, articleId: number) {
    setSelections(prev => {
      const updated = [...prev]
      updated[activePersonne] = { ...updated[activePersonne], [slotId]: articleId }
      return updated
    })
  }

  // GROUPE : sélectionne un article pour la configuration commune
  function selectArticleGroupe(slotId: number, articleId: number) {
    setSelections([{ ...selections[0], [slotId]: articleId }])
  }

  function changeQty(extraId: number, delta: number) {
    setExtraQty(prev => {
      const current = prev[extraId] ?? 0
      const next = Math.max(0, current + delta)
      if (next === 0) {
        const { [extraId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [extraId]: next }
    })
  }

  // ── États dérivés ──
  const totalFormule = formule ? formule.prix * nbPersonnes : 0
  const totalExtras  = extras.reduce((sum, e) => sum + (extraQty[e.id] ?? 0) * e.prix, 0)
  const total        = totalFormule + totalExtras

  // GROUPE : la config commune est complète
  // INDIVIDUEL : toutes les personnes ont tous leurs slots remplis
  const allSelected = formule
    ? isGroupe
      ? formule.slots.every(slot => selections[0]?.[slot.id])
      : selections.every(ps => formule.slots.every(slot => ps[slot.id]))
    : false

  function isPersonneComplete(i: number) {
    if (!formule) return false
    return formule.slots.every(slot => selections[i]?.[slot.id])
  }

  function addToCart() {
    if (!formule || !allSelected) return

    const selectionsDetail = selections.map(personSel => {
      const detail: Record<number, { slotNom: string; articleNom: string }> = {}
      for (const slot of formule.slots) {
        const articleNom = slot.articles.find(sa => sa.article.id === personSel[slot.id])?.article.nom ?? ""
        detail[slot.id] = { slotNom: slot.nom, articleNom }
      }
      return detail
    })

    const extrasDetail = extras
      .filter(e => extraQty[e.id])
      .map(e => ({ extraId: e.id, nom: e.nom, prix: e.prix, quantite: extraQty[e.id] }))

    addItem({
      formuleId:   formule.id,
      formuleNom:  formule.nom,
      formulePrix: formule.prix,
      nbPersonnes,
      selections:  selectionsDetail,
      extras:      extrasDetail,
      subtotal:    total,
    })

    setToast(true)
    setTimeout(() => router.push("/#formules"), 3000)
  }

  if (!formule) return <div className="commander-loading">Chargement...</div>

  return (
    <main className="commander">

      <div className="commander-header">
        <a href="/#formules" className="commander-back">← Retour aux formules</a>
        <h1>Formule <em>{formule.nom}</em></h1>
        <p>{formule.prix.toFixed(2)} € / personne</p>
      </div>

      <div className="commander-body">

        {/* ── Colonne gauche ── */}
        <div className="commander-slots">

          {isGroupe ? (
            /* ════════════════════════════════
               MODE GROUPE — config commune
               ════════════════════════════════ */
            <>
              <h2>Composez le plateau</h2>
              <p className="extras-subtitle">Une composition commune pour tous les plateaux</p>

              {formule.slots.map(slot => (
                <div key={slot.id} className="slot-group">
                  <h3>{slot.nom}</h3>
                  <div className="slot-articles">
                    {slot.articles.map(sa => (
                      <label
                        key={sa.article.id}
                        className={`article-option ${selections[0]?.[slot.id] === sa.article.id ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`slot-${slot.id}`}
                          value={sa.article.id}
                          checked={selections[0]?.[slot.id] === sa.article.id}
                          onChange={() => selectArticleGroupe(slot.id, sa.article.id)}
                        />
                        {sa.article.nom}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            /* ════════════════════════════════
               MODE INDIVIDUEL — onglets
               ════════════════════════════════ */
            <>
              <div className="personnes-header">
                <h2>Composez les plateaux</h2>
                <div className="personnes-counter">
                  <button onClick={() => changeNbPersonnes(-1)} disabled={selections.length <= 1}>−</button>
                  <span>{selections.length} personne{selections.length > 1 ? "s" : ""}</span>
                  <button onClick={() => changeNbPersonnes(1)}>+</button>
                </div>
              </div>

              <div className="personnes-tabs">
                {selections.map((_, i) => (
                  <button
                    key={i}
                    className={`personne-tab ${activePersonne === i ? "active" : ""} ${isPersonneComplete(i) ? "complete" : ""}`}
                    onClick={() => setActivePersonne(i)}
                  >
                    Plateau {i + 1}
                    {isPersonneComplete(i) && <span className="tab-check">✓</span>}
                  </button>
                ))}
              </div>

              {formule.slots.map(slot => (
                <div key={slot.id} className="slot-group">
                  <h3>{slot.nom}</h3>
                  <div className="slot-articles">
                    {slot.articles.map(sa => (
                      <label
                        key={sa.article.id}
                        className={`article-option ${selections[activePersonne]?.[slot.id] === sa.article.id ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`slot-${slot.id}-p${activePersonne}`}
                          value={sa.article.id}
                          checked={selections[activePersonne]?.[slot.id] === sa.article.id}
                          onChange={() => selectArticleIndividuel(slot.id, sa.article.id)}
                        />
                        {sa.article.nom}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Extras (communs aux deux modes) ── */}
          {extras.length > 0 && (
            <div className="extras-section">
              <h2>Ajouter des extras</h2>
              <p className="extras-subtitle">Articles supplémentaires à la carte</p>
              <div className="extras-list">
                {extras.map(extra => (
                  <div key={extra.id} className="extra-item">
                    <span className="extra-nom">{extra.nom}</span>
                    <span className="extra-prix">{extra.prix.toFixed(2)} €</span>
                    <div className="extra-counter">
                      <button onClick={() => changeQty(extra.id, -1)} disabled={!extraQty[extra.id]}>−</button>
                      <span>{extraQty[extra.id] ?? 0}</span>
                      <button onClick={() => changeQty(extra.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Colonne droite : récapitulatif ── */}
        <div className="commander-summary">
          <h2>Récapitulatif</h2>

          {/* Sélecteur de quantité — GROUPE seulement */}
          {isGroupe && (
            <div className="summary-personnes">
              <label>Nombre de plateaux</label>
              <div className="personnes-counter">
                <button onClick={() => setNbGroupePersonnes(n => Math.max(10, n - 1))}>−</button>
                <span>{nbGroupePersonnes}</span>
                <button onClick={() => setNbGroupePersonnes(n => n + 1)}>+</button>
              </div>
            </div>
          )}

          {/* Sélections */}
          {isGroupe ? (
            <div className="summary-selections">
              <p className="summary-section-title">Composition commune</p>
              {formule.slots.map(slot => (
                <div key={slot.id} className="summary-line">
                  <span>{slot.nom}</span>
                  <span>
                    {selections[0]?.[slot.id]
                      ? slot.articles.find(sa => sa.article.id === selections[0][slot.id])?.article.nom
                      : <em>Non choisi</em>
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            selections.map((personSel, i) => (
              <div key={i} className="summary-selections">
                <p className="summary-section-title">
                  {selections.length > 1 ? `Plateau ${i + 1}` : "Votre plateau"}
                </p>
                {formule.slots.map(slot => (
                  <div key={slot.id} className="summary-line">
                    <span>{slot.nom}</span>
                    <span>
                      {personSel[slot.id]
                        ? slot.articles.find(sa => sa.article.id === personSel[slot.id])?.article.nom
                        : <em>Non choisi</em>
                      }
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}

          {/* Extras */}
          {Object.keys(extraQty).length > 0 && (
            <div className="summary-extras">
              <p className="summary-section-title">Extras</p>
              {extras.filter(e => extraQty[e.id]).map(extra => (
                <div key={extra.id} className="summary-line">
                  <span>{extra.nom} × {extraQty[extra.id]}</span>
                  <span>{(extra.prix * extraQty[extra.id]).toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="summary-total">
            <div className="summary-line">
              <span>Formule × {nbPersonnes}</span>
              <span>{totalFormule.toFixed(2)} €</span>
            </div>
            {totalExtras > 0 && (
              <div className="summary-line">
                <span>Extras</span>
                <span>{totalExtras.toFixed(2)} €</span>
              </div>
            )}
            <div className="summary-line total">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <button className="summary-cta" disabled={!allSelected} onClick={addToCart}>
            Ajouter au panier
          </button>
          {!allSelected && (
            <p className="summary-warning">
              {isGroupe
                ? "Veuillez choisir un article pour chaque slot"
                : "Veuillez compléter le plateau de chaque personne"
              }
            </p>
          )}

        </div>
      </div>

      {toast && (
        <div className="toast">
          <span className="toast-icon">✓</span>
          <div>
            <strong>Ajouté au panier !</strong>
            <p>Retour aux formules en cours...</p>
          </div>
        </div>
      )}

    </main>
  )
}
