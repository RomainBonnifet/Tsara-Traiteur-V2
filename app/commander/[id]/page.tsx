"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/context/CartContext"

// --- Types ---
type Article     = { id: number; nom: string; description?: string; image?: string }
type SlotArticle = { article: Article }
type Slot        = { id: number; nom: string; capacite: number; articles: SlotArticle[] }
type Categorie   = { id: number; nom: string }
type Formule     = { id: number; nom: string; prix: number; description: string | null; minPersonnes: number; pasPersonnes: number; categorie: Categorie; slots: Slot[] }
type Extra       = { id: number; nom: string; prix: number; description?: string; image?: string }

export default function CommanderPage() {
  const { id }      = useParams()
  const router      = useRouter()
  const { addItem } = useCart()

  const [formule, setFormule] = useState<Formule | null>(null)
  const [extras, setExtras]   = useState<Extra[]>([])
  const [toast, setToast]     = useState(false)

  // Un tableau de dicts : selections[personneIndex][slotId] = articleId
  // Pour GROUPE : un seul élément (selections[0])
  const [selections, setSelections]         = useState<Array<Record<number, number>>>([{}])
  const [activePersonne, setActivePersonne] = useState(0)

  // Pour GROUPE uniquement : nombre de plateaux (découplé des sélections)
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

  // Quand la formule charge, initialiser le nombre de personnes au minimum requis
  useEffect(() => {
    if (!formule) return
    const isG = formule.categorie.nom === "Groupe"
    if (!isG && formule.minPersonnes > 1) {
      setSelections(Array.from({ length: formule.minPersonnes }, () => ({})))
    }
  }, [formule])

  const isGroupe   = formule?.categorie.nom === "Groupe"
  const nbPersonnes = isGroupe ? nbGroupePersonnes : selections.length

  // ── Logique de groupe ──
  // Pour un slot de capacite C, les personnes 0, C, 2C, ... sont "chefs de groupe".
  // Elles choisissent pour tout leur groupe. Les autres reçoivent automatiquement le même choix.

  function getGroupLeader(personIndex: number, capacite: number): number {
    return Math.floor(personIndex / capacite) * capacite
  }

  function isGroupLeader(personIndex: number, capacite: number): boolean {
    return personIndex % capacite === 0
  }

  // Quand on sélectionne un article pour un slot partagé, on propage à tout le groupe
  function selectArticle(slotId: number, articleId: number, capacite: number) {
    const groupStart = getGroupLeader(activePersonne, capacite)
    const groupEnd   = Math.min(groupStart + capacite - 1, selections.length - 1)

    setSelections(prev => {
      const updated = prev.map(sel => ({ ...sel }))
      for (let p = groupStart; p <= groupEnd; p++) {
        updated[p] = { ...updated[p], [slotId]: articleId }
      }
      return updated
    })
  }

  function selectArticleGroupe(slotId: number, articleId: number) {
    setSelections([{ ...selections[0], [slotId]: articleId }])
  }

  // +/- personnes en respectant minPersonnes et pasPersonnes
  function changeNbPersonnes(delta: number) {
    if (!formule) return
    const min  = formule.minPersonnes
    const step = formule.pasPersonnes

    setSelections(prev => {
      const next = Math.max(min, prev.length + (delta > 0 ? step : -step))
      if (next > prev.length) {
        return [...prev, ...Array.from({ length: next - prev.length }, () => ({}))]
      } else if (next < prev.length) {
        setActivePersonne(curr => Math.min(curr, next - 1))
        return prev.slice(0, next)
      }
      return prev
    })
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

  // Pour les slots partagés, seuls les chefs de groupe doivent avoir fait un choix
  // (les autres reçoivent le choix du chef automatiquement)
  const allSelected = formule
    ? isGroupe
      ? formule.slots.every(slot => selections[0]?.[slot.id])
      : formule.slots.every(slot =>
          // Pour chaque groupe dans ce slot, le chef a fait son choix
          Array.from({ length: Math.ceil(selections.length / slot.capacite) }, (_, g) => g * slot.capacite)
            .every(leaderIdx => selections[leaderIdx]?.[slot.id])
        )
    : false

  function isPersonneComplete(i: number) {
    if (!formule) return false
    return formule.slots.every(slot => selections[i]?.[slot.id])
  }

  function addToCart() {
    if (!formule || !allSelected) return

    const selectionsDetail = selections.map(personSel => {
      const detail: Record<number, { slotNom: string; articleNom: string; articleId: number }> = {}
      for (const slot of formule.slots) {
        const sa = slot.articles.find(sa => sa.article.id === personSel[slot.id])
        detail[slot.id] = { slotNom: slot.nom, articleNom: sa?.article.nom ?? "", articleId: sa?.article.id ?? 0 }
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
      isGroupe,
      selections:  selectionsDetail,
      extras:      extrasDetail,
      subtotal:    total,
    })

    setToast(true)
    setTimeout(() => router.push("/#formules"), 3000)
  }

  if (!formule) return <div className="commander-loading">Chargement...</div>

  // ── Composant carte article ──
  // autoSelected = sélectionné automatiquement (non-chef de groupe) : affiché comme sélectionné mais non cliquable
  function ArticleCard({ sa, selected, onSelect, autoSelected, leaderIndex }: {
    sa: SlotArticle
    selected: boolean
    onSelect: () => void
    autoSelected?: boolean
    leaderIndex?: number
  }) {
    return (
      <button
        className={`article-card ${selected ? "selected" : ""} ${autoSelected ? "article-card-auto" : ""}`}
        onClick={autoSelected ? undefined : onSelect}
        type="button"
        style={autoSelected ? { cursor: "default" } : undefined}
      >
        <div className="article-card-img">
          {sa.article.image
            ? <Image src={sa.article.image} alt={sa.article.nom} fill style={{ objectFit: "cover" }} />
            : <div className="article-card-placeholder" />
          }
          {selected && (
            <div className="article-card-check">{autoSelected ? "↑" : "✓"}</div>
          )}
        </div>
        <div className="article-card-body">
          <p className="article-card-nom">{sa.article.nom}</p>
          {sa.article.description && (
            <p className="article-card-desc">{sa.article.description}</p>
          )}
          {autoSelected && (
            <p className="article-card-auto-label">Identique au plateau {(leaderIndex ?? 0) + 1}</p>
          )}
        </div>
      </button>
    )
  }

  // ── Composant carte extra ──
  function ExtraCard({ extra }: { extra: Extra }) {
    const qty = extraQty[extra.id] ?? 0
    return (
      <button
        className={`article-card ${qty > 0 ? "selected" : ""}`}
        onClick={() => changeQty(extra.id, 1)}
        type="button"
      >
        <div className="article-card-img">
          {extra.image
            ? <Image src={extra.image} alt={extra.nom} fill style={{ objectFit: "cover" }} />
            : <div className="article-card-placeholder" />
          }
          {qty > 0 && (
            <>
              <div className="article-card-check extra-card-qty">{qty}</div>
              <div
                className="extra-card-remove"
                onClick={e => { e.stopPropagation(); changeQty(extra.id, -1) }}
                title="Retirer un"
              >✕</div>
            </>
          )}
        </div>
        <div className="article-card-body">
          <p className="article-card-nom">{extra.nom}</p>
          {extra.description && (
            <p className="article-card-desc">{extra.description}</p>
          )}
          <p className="extra-card-prix">{extra.prix.toFixed(2)} €</p>
        </div>
      </button>
    )
  }

  return (
    <main className="commander">

      <div className="commander-header">
        <a href="/#formules" className="commander-back">← Retour aux formules</a>
        <h1>Formule <em>{formule.nom}</em></h1>
        <p>{formule.prix.toFixed(2)} € / personne</p>
        {formule.description && (
          <p className="commander-description">{formule.description}</p>
        )}
      </div>

      <div className="commander-body">

        {/* ── Colonne gauche ── */}
        <div className="commander-slots">

          {isGroupe ? (
            <>
              <h2>Composez le plateau</h2>
              <p className="extras-subtitle">Une composition commune pour tous les plateaux</p>

              {formule.slots.map(slot => (
                <div key={slot.id} className="slot-group">
                  <h3>{slot.nom}</h3>
                  <div className="articles-grid">
                    {slot.articles.map(sa => (
                      <ArticleCard
                        key={sa.article.id}
                        sa={sa}
                        selected={selections[0]?.[slot.id] === sa.article.id}
                        onSelect={() => selectArticleGroupe(slot.id, sa.article.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="personnes-header">
                <h2>Composez les plateaux</h2>
                <div className="personnes-counter">
                  <button onClick={() => changeNbPersonnes(-1)} disabled={selections.length <= formule.minPersonnes}>−</button>
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

              {formule.slots.map(slot => {
                const leader   = getGroupLeader(activePersonne, slot.capacite)
                const isLeader = isGroupLeader(activePersonne, slot.capacite)
                // Nombre de personnes couvertes par le groupe de activePersonne pour ce slot
                const groupSize = Math.min(slot.capacite, selections.length - leader)

                return (
                  <div key={slot.id} className="slot-group">
                    <h3>
                      {slot.nom}
                      {slot.capacite > 1 && (
                        <span className="slot-shared-badge">
                          {isLeader
                            ? `1 choix pour ${groupSize} personne${groupSize > 1 ? "s" : ""}`
                            : `Même choix que le plateau ${leader + 1}`
                          }
                        </span>
                      )}
                    </h3>
                    <div className="articles-grid">
                      {slot.articles.map(sa => (
                        <ArticleCard
                          key={sa.article.id}
                          sa={sa}
                          selected={selections[activePersonne]?.[slot.id] === sa.article.id}
                          autoSelected={!isLeader}
                          leaderIndex={leader}
                          onSelect={() => selectArticle(slot.id, sa.article.id, slot.capacite)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* ── Extras ── */}
          {extras.length > 0 && (
            <div className="extras-section">
              <h2>Ajouter des extras</h2>
              <p className="extras-subtitle">Articles supplémentaires à la carte</p>
              <div className="articles-grid">
                {extras.map(extra => (
                  <ExtraCard key={extra.id} extra={extra} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Colonne droite : récapitulatif ── */}
        <div className="commander-summary">
          <h2>Récapitulatif</h2>

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
            // Dans le récap, on affiche un bloc par groupe (pas par personne) pour les slots partagés
            // On utilise le premier plateau de chaque groupe comme représentant
            Array.from({ length: selections.length }, (_, i) => i)
              .filter(() => true)
              .map((i) => (
                <div key={i} className="summary-selections">
                  <p className="summary-section-title">
                    {selections.length > 1 ? `Plateau ${i + 1}` : "Votre plateau"}
                  </p>
                  {formule.slots.map(slot => {
                    const leader   = getGroupLeader(i, slot.capacite)
                    const isLeader = isGroupLeader(i, slot.capacite)
                    return (
                      <div key={slot.id} className="summary-line">
                        <span>{slot.nom}</span>
                        <span>
                          {selections[i]?.[slot.id]
                            ? <>
                                {slot.articles.find(sa => sa.article.id === selections[i][slot.id])?.article.nom}
                                {!isLeader && <em style={{ fontSize: ".75rem", marginLeft: ".3rem", opacity: .6 }}>(plateau {leader + 1})</em>}
                              </>
                            : <em>Non choisi</em>
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))
          )}

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
