"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

type Article = {
  id: number
  nom: string
  description: string | null
  image: string | null
  disponible: boolean
}

// Upload une image vers /api/admin/upload et retourne l'URL publique
async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch("/api/admin/upload", { method: "POST", body: form })
  const data = await res.json()
  return data.url
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading]   = useState(true)
  const [editId, setEditId]     = useState<number | null>(null)
  const [editData, setEditData] = useState({ nom: "", description: "", image: "" })
  const [newData, setNewData]   = useState({ nom: "", description: "", image: "" })
  const [saving, setSaving]     = useState(false)
  const [message, setMessage]   = useState("")

  const editFileRef = useRef<HTMLInputElement>(null)
  const newFileRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/articles")
      .then(r => r.json())
      .then(setArticles)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(a: Article) {
    setEditId(a.id)
    setEditData({ nom: a.nom, description: a.description || "", image: a.image || "" })
  }

  async function handleEditImage(file: File) {
    const url = await uploadImage(file)
    setEditData(prev => ({ ...prev, image: url }))
  }

  async function handleNewImage(file: File) {
    const url = await uploadImage(file)
    setNewData(prev => ({ ...prev, image: url }))
  }

  async function handleEdit(id: number) {
    setSaving(true)
    setMessage("")
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: editData.nom, description: editData.description, image: editData.image }),
    })
    if (res.ok) {
      const updated = await res.json()
      setArticles(articles.map(a => a.id === id ? updated : a))
      setEditId(null)
      setMessage("Article modifié.")
    } else {
      setMessage("Erreur lors de la modification.")
    }
    setSaving(false)
  }

  async function toggleDispo(a: Article) {
    const res = await fetch(`/api/admin/articles/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !a.disponible }),
    })
    if (res.ok) {
      const updated = await res.json()
      setArticles(articles.map(art => art.id === a.id ? updated : art))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet article ?")) return
    const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" })
    if (res.ok) {
      setArticles(articles.filter(a => a.id !== id))
      setMessage("Article supprimé.")
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    })
    if (res.ok) {
      const created = await res.json()
      setArticles([...articles, created])
      setNewData({ nom: "", description: "", image: "" })
      if (newFileRef.current) newFileRef.current.value = ""
      setMessage("Article ajouté.")
    } else {
      setMessage("Erreur lors de l'ajout.")
    }
    setSaving(false)
  }

  if (loading) return <div className="dash-loading">Chargement...</div>

  return (
    <div>
      <h1 className="dash-title">Articles</h1>
      {message && <p className="dash-message">{message}</p>}

      <table className="dash-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Dispo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(a =>
            editId === a.id ? (
              <tr key={a.id} className="dash-row-edit">
                <td>
                  {/* Miniature + bouton pour changer l'image */}
                  <div className="dash-img-cell">
                    {editData.image && (
                      <Image src={editData.image} alt={editData.nom} width={36} height={36} style={{ objectFit: "cover", borderRadius: 6 }} />
                    )}
                    <input ref={editFileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => e.target.files?.[0] && handleEditImage(e.target.files[0])} />
                    <button className="dash-btn dash-btn-sm" type="button" onClick={() => editFileRef.current?.click()}>
                      {editData.image ? "Changer" : "Ajouter photo"}
                    </button>
                  </div>
                </td>
                <td>
                  <input className="dash-input" value={editData.nom}
                    onChange={e => setEditData({ ...editData, nom: e.target.value })} />
                </td>
                <td>
                  <input className="dash-input" value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })} />
                </td>
                <td>
                  <span className={`badge ${a.disponible ? "badge-payee" : "badge-annulee"}`}>
                    {a.disponible ? "Dispo" : "Indispo"}
                  </span>
                </td>
                <td className="dash-actions">
                  <button className="dash-btn dash-btn-sm" onClick={() => handleEdit(a.id)} disabled={saving}>Sauver</button>
                  <button className="dash-btn dash-btn-sm dash-btn-neutral" onClick={() => setEditId(null)}>Annuler</button>
                </td>
              </tr>
            ) : (
              <tr key={a.id}>
                <td>
                  {a.image
                    ? <Image src={a.image} alt={a.nom} width={50} height={50} style={{ objectFit: "cover", borderRadius: 6 }} />
                    : <span className="dash-no-img">—</span>
                  }
                </td>
                <td>{a.nom}</td>
                <td>{a.description || "—"}</td>
                <td>
                  <button className={`badge badge-toggle ${a.disponible ? "badge-payee" : "badge-annulee"}`}
                    onClick={() => toggleDispo(a)} title="Cliquer pour changer">
                    {a.disponible ? "Dispo" : "Indispo"}
                  </button>
                </td>
                <td className="dash-actions">
                  <button className="dash-btn dash-btn-sm" onClick={() => startEdit(a)}>Modifier</button>
                  <button className="dash-btn dash-btn-sm dash-btn-danger" onClick={() => handleDelete(a.id)}>Supprimer</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="dash-section">
        <h2 className="dash-subtitle">Ajouter un article</h2>
        <form className="dash-form" onSubmit={handleAdd}>
          <div className="dash-form-row">
            <div className="dash-field">
              <label className="dash-label">Nom</label>
              <input className="dash-input" required value={newData.nom}
                onChange={e => setNewData({ ...newData, nom: e.target.value })} />
            </div>
            <div className="dash-field">
              <label className="dash-label">Description</label>
              <input className="dash-input" value={newData.description}
                onChange={e => setNewData({ ...newData, description: e.target.value })} />
            </div>
          </div>
          <div className="dash-field">
            <label className="dash-label">Photo</label>
            <div className="dash-upload-row">
              <input ref={newFileRef} type="file" accept="image/*"
                onChange={e => e.target.files?.[0] && handleNewImage(e.target.files[0])} />
              {newData.image && (
                <Image src={newData.image} alt="aperçu" width={36} height={36} style={{ objectFit: "cover", borderRadius: 6 }} />
              )}
            </div>
          </div>
          <button className="dash-btn" type="submit" disabled={saving}>
            {saving ? "Ajout..." : "Ajouter l'article"}
          </button>
        </form>
      </div>
    </div>
  )
}
