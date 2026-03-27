"use client"

// Page de gestion des formules.
// L'admin peut voir, modifier, supprimer et créer des formules.
// Il peut aussi définir des slots dès la création, et accéder à l'éditeur de slots.

import { useEffect, useState } from "react"
import Link from "next/link"

type Formule = {
  id: number
  nom: string
  prix: number
  description: string | null
  categorieId: number
  categorie: { id: number; nom: string }
}

type Categorie = {
  id: number
  nom: string
}

type Article = {
  id: number
  nom: string
  disponible: boolean
}

// Un slot en cours de création (avant que la formule soit enregistrée)
type NewSlot = {
  nom: string
  articleIds: number[]
}

export default function FormulesPage() {
  const [formules, setFormules] = useState<Formule[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // editId = l'id de la formule en cours d'édition, null si aucune
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState({ nom: "", prix: "", description: "" })

  // Formulaire d'ajout d'une nouvelle formule
  const [newData, setNewData] = useState({
    nom: "",
    prix: "",
    description: "",
    categorieId: "",
  })

  // Slots à créer en même temps que la formule
  const [newSlots, setNewSlots] = useState<NewSlot[]>([])

  // Pour chaque slot en création, l'article sélectionné dans son <select>
  const [slotArticleSelect, setSlotArticleSelect] = useState<Record<number, string>>({})

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/formules").then((r) => r.json()),
      fetch("/api/formules").then((r) => r.json()),
      fetch("/api/admin/articles").then((r) => r.json()),
    ]).then(([formulesData, catsData, articlesData]) => {
      setFormules(formulesData)
      setCategories(catsData.map((c: { id: number; nom: string }) => ({ id: c.id, nom: c.nom })))
      setAllArticles(articlesData)
      setLoading(false)
    })
  }, [])

  // Démarre l'édition d'une formule : on pré-remplit les champs avec ses valeurs actuelles
  function startEdit(f: Formule) {
    setEditId(f.id)
    setEditData({ nom: f.nom, prix: String(f.prix), description: f.description || "" })
  }

  async function handleEdit(id: number) {
    setSaving(true)
    setMessage("")
    const res = await fetch(`/api/admin/formules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: editData.nom,
        prix: parseFloat(editData.prix),
        description: editData.description,
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setFormules(formules.map((f) => (f.id === id ? updated : f)))
      setEditId(null)
      setMessage("Formule modifiée.")
    } else {
      setMessage("Erreur lors de la modification.")
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette formule ? Cette action est irréversible.")) return
    setMessage("")
    const res = await fetch(`/api/admin/formules/${id}`, { method: "DELETE" })

    if (res.ok) {
      setFormules(formules.filter((f) => f.id !== id))
      setMessage("Formule supprimée.")
    } else {
      const data = await res.json()
      setMessage(data.error || "Erreur lors de la suppression.")
    }
  }

  // --- Gestion des slots dans le formulaire de création ---

  function addNewSlot() {
    setNewSlots([...newSlots, { nom: "", articleIds: [] }])
  }

  function updateSlotNom(index: number, nom: string) {
    setNewSlots(newSlots.map((s, i) => (i === index ? { ...s, nom } : s)))
  }

  function removeNewSlot(index: number) {
    setNewSlots(newSlots.filter((_, i) => i !== index))
  }

  function addArticleToNewSlot(index: number) {
    const articleId = parseInt(slotArticleSelect[index] ?? "")
    if (!articleId) return

    setNewSlots(
      newSlots.map((s, i) =>
        i === index && !s.articleIds.includes(articleId)
          ? { ...s, articleIds: [...s.articleIds, articleId] }
          : s
      )
    )
    setSlotArticleSelect((prev) => ({ ...prev, [index]: "" }))
  }

  function removeArticleFromNewSlot(slotIndex: number, articleId: number) {
    setNewSlots(
      newSlots.map((s, i) =>
        i === slotIndex ? { ...s, articleIds: s.articleIds.filter((id) => id !== articleId) } : s
      )
    )
  }

  // --- Création de la formule avec ses slots ---
  // On procède en 3 étapes :
  // 1. Créer la formule → on récupère son id
  // 2. Pour chaque slot → POST /api/admin/formules/[id]/slots
  // 3. Pour chaque article du slot → POST /api/admin/slots/[slotId]/articles
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    // Étape 1 : créer la formule
    const res = await fetch("/api/admin/formules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: newData.nom,
        prix: parseFloat(newData.prix),
        description: newData.description,
        categorieId: parseInt(newData.categorieId),
      }),
    })

    if (!res.ok) {
      setMessage("Erreur lors de l'ajout.")
      setSaving(false)
      return
    }

    const created = await res.json()

    // Étape 2 & 3 : créer les slots et leurs articles
    for (const slot of newSlots) {
      if (!slot.nom.trim()) continue

      const slotRes = await fetch(`/api/admin/formules/${created.id}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: slot.nom }),
      })

      if (slotRes.ok) {
        const createdSlot = await slotRes.json()
        for (const articleId of slot.articleIds) {
          await fetch(`/api/admin/slots/${createdSlot.id}/articles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId }),
          })
        }
      }
    }

    setFormules([...formules, created])
    setNewData({ nom: "", prix: "", description: "", categorieId: "" })
    setNewSlots([])
    setSlotArticleSelect({})
    setMessage("Formule ajoutée avec ses slots.")
    setSaving(false)
  }

  if (loading) return <div className="dash-loading">Chargement...</div>

  return (
    <div>
      <h1 className="dash-title">Formules</h1>
      {message && <p className="dash-message">{message}</p>}

      <table className="dash-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {formules.map((f) =>
            editId === f.id ? (
              // Ligne en mode édition
              <tr key={f.id} className="dash-row-edit">
                <td>
                  <input
                    className="dash-input"
                    value={editData.nom}
                    onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="dash-input"
                    type="number"
                    step="0.01"
                    value={editData.prix}
                    onChange={(e) => setEditData({ ...editData, prix: e.target.value })}
                  />
                </td>
                <td>{f.categorie.nom}</td>
                <td>
                  <input
                    className="dash-input"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                </td>
                <td className="dash-actions">
                  <button
                    className="dash-btn dash-btn-sm"
                    onClick={() => handleEdit(f.id)}
                    disabled={saving}
                  >
                    Sauver
                  </button>
                  <button
                    className="dash-btn dash-btn-sm dash-btn-neutral"
                    onClick={() => setEditId(null)}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ) : (
              // Ligne normale
              <tr key={f.id}>
                <td>{f.nom}</td>
                <td>{f.prix.toFixed(2)} €</td>
                <td>{f.categorie.nom}</td>
                <td>{f.description || "—"}</td>
                <td className="dash-actions">
                  <button
                    className="dash-btn dash-btn-sm"
                    onClick={() => startEdit(f)}
                  >
                    Modifier
                  </button>
                  <button
                    className="dash-btn dash-btn-sm dash-btn-danger"
                    onClick={() => handleDelete(f.id)}
                  >
                    X
                  </button>
                  {/* Lien vers la page d'édition des slots */}
                  <Link
                    href={`/dashboard/formules/${f.id}`}
                    className="dash-btn dash-btn-sm dash-btn-neutral"
                    style={{ textDecoration: "none" }}
                  >
                    Slots
                  </Link>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {/* ── Formulaire d'ajout ── */}
      <div className="dash-section">
        <h2 className="dash-subtitle">Ajouter une formule</h2>
        <form className="dash-form" onSubmit={handleAdd}>
          <div className="dash-form-row">
            <div className="dash-field">
              <label className="dash-label">Nom</label>
              <input
                className="dash-input"
                required
                value={newData.nom}
                onChange={(e) => setNewData({ ...newData, nom: e.target.value })}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">Prix (€)</label>
              <input
                className="dash-input"
                type="number"
                step="0.01"
                required
                value={newData.prix}
                onChange={(e) => setNewData({ ...newData, prix: e.target.value })}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">Catégorie</label>
              <select
                className="dash-input"
                required
                value={newData.categorieId}
                onChange={(e) => setNewData({ ...newData, categorieId: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dash-field">
            <label className="dash-label">Description</label>
            <input
              className="dash-input"
              value={newData.description}
              onChange={(e) => setNewData({ ...newData, description: e.target.value })}
            />
          </div>

          {/* ── Slots à créer avec la formule ── */}
          {newSlots.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p className="dash-label" style={{ marginBottom: ".5rem" }}>
                Slots de la formule
              </p>
              {newSlots.map((slot, index) => {
                // Articles déjà sélectionnés dans ce slot
                const articlesDejaChoisis = slot.articleIds
                // Articles disponibles (pas encore dans ce slot)
                const articlesDispos = allArticles.filter(
                  (a) => !articlesDejaChoisis.includes(a.id)
                )

                return (
                  <div key={index} className="slot-card">
                    <div className="slot-card-header">
                      <input
                        className="dash-input"
                        style={{ flex: 1, minWidth: 0 }}
                        placeholder="Nom du slot (ex: Boisson chaude)"
                        value={slot.nom}
                        onChange={(e) => updateSlotNom(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="dash-btn dash-btn-sm dash-btn-danger"
                        onClick={() => removeNewSlot(index)}
                      >
                        Supprimer
                      </button>
                    </div>

                    {/* Articles sélectionnés pour ce slot */}
                    <div className="slot-articles-list">
                      {slot.articleIds.length === 0 && (
                        <span style={{ fontSize: ".8rem", color: "var(--brun-clair)" }}>
                          Aucun article sélectionné.
                        </span>
                      )}
                      {slot.articleIds.map((aId) => {
                        const art = allArticles.find((a) => a.id === aId)
                        return (
                          <span key={aId} className="slot-article-tag">
                            {art?.nom ?? aId}
                            <button
                              type="button"
                              onClick={() => removeArticleFromNewSlot(index, aId)}
                              title="Retirer"
                            >
                              ✕
                            </button>
                          </span>
                        )
                      })}
                    </div>

                    {/* Ajout d'un article à ce slot */}
                    <div className="slot-add-article">
                      <select
                        className="dash-input"
                        value={slotArticleSelect[index] ?? ""}
                        onChange={(e) =>
                          setSlotArticleSelect((prev) => ({ ...prev, [index]: e.target.value }))
                        }
                      >
                        <option value="">— Ajouter un article —</option>
                        {articlesDispos.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nom}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="dash-btn dash-btn-sm"
                        onClick={() => addArticleToNewSlot(index)}
                        disabled={!slotArticleSelect[index]}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <button
            type="button"
            className="dash-btn dash-btn-neutral"
            onClick={addNewSlot}
            style={{ marginTop: ".75rem" }}
          >
            + Ajouter un slot
          </button>

          <button className="dash-btn" type="submit" disabled={saving} style={{ marginTop: ".5rem" }}>
            {saving ? "Ajout..." : "Ajouter la formule"}
          </button>
        </form>
      </div>
    </div>
  )
}
