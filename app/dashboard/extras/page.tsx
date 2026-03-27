"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

type Extra = {
  id: number
  nom: string
  prix: number
  description: string | null
  image: string | null
  disponible: boolean
}

async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch("/api/admin/upload", { method: "POST", body: form })
  const data = await res.json()
  return data.url
}

export default function ExtrasPage() {
  const [extras, setExtras]   = useState<Extra[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId]   = useState<number | null>(null)
  const [editData, setEditData] = useState({ nom: "", prix: "", description: "", image: "" })
  const [newData, setNewData]   = useState({ nom: "", prix: "", description: "", image: "" })
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState("")

  const editFileRef = useRef<HTMLInputElement>(null)
  const newFileRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/extras")
      .then(r => r.json())
      .then(setExtras)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(ex: Extra) {
    setEditId(ex.id)
    setEditData({ nom: ex.nom, prix: String(ex.prix), description: ex.description || "", image: ex.image || "" })
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
    const res = await fetch(`/api/admin/extras/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: editData.nom, prix: parseFloat(editData.prix), description: editData.description, image: editData.image }),
    })
    if (res.ok) {
      const updated = await res.json()
      setExtras(extras.map(ex => ex.id === id ? updated : ex))
      setEditId(null)
      setMessage("Extra modifié.")
    } else {
      setMessage("Erreur lors de la modification.")
    }
    setSaving(false)
  }

  async function toggleDispo(ex: Extra) {
    const res = await fetch(`/api/admin/extras/${ex.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !ex.disponible }),
    })
    if (res.ok) {
      const updated = await res.json()
      setExtras(extras.map(e => e.id === ex.id ? updated : e))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet extra ?")) return
    const res = await fetch(`/api/admin/extras/${id}`, { method: "DELETE" })
    if (res.ok) {
      setExtras(extras.filter(e => e.id !== id))
      setMessage("Extra supprimé.")
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    const res = await fetch("/api/admin/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: newData.nom, prix: parseFloat(newData.prix), description: newData.description, image: newData.image }),
    })
    if (res.ok) {
      const created = await res.json()
      setExtras([...extras, created])
      setNewData({ nom: "", prix: "", description: "", image: "" })
      if (newFileRef.current) newFileRef.current.value = ""
      setMessage("Extra ajouté.")
    } else {
      setMessage("Erreur lors de l'ajout.")
    }
    setSaving(false)
  }

  if (loading) return <div className="dash-loading">Chargement...</div>

  return (
    <div>
      <h1 className="dash-title">Extras</h1>
      {message && <p className="dash-message">{message}</p>}

      <table className="dash-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Prix</th>
            <th>Dispo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {extras.map(ex =>
            editId === ex.id ? (
              <tr key={ex.id} className="dash-row-edit">
                <td>
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
                  <input className="dash-input" type="number" step="0.01" value={editData.prix}
                    onChange={e => setEditData({ ...editData, prix: e.target.value })} />
                </td>
                <td>
                  <span className={`badge ${ex.disponible ? "badge-payee" : "badge-annulee"}`}>
                    {ex.disponible ? "Dispo" : "Indispo"}
                  </span>
                </td>
                <td className="dash-actions">
                  <button className="dash-btn dash-btn-sm" onClick={() => handleEdit(ex.id)} disabled={saving}>Sauver</button>
                  <button className="dash-btn dash-btn-sm dash-btn-neutral" onClick={() => setEditId(null)}>Annuler</button>
                </td>
              </tr>
            ) : (
              <tr key={ex.id}>
                <td>
                  {ex.image
                    ? <Image src={ex.image} alt={ex.nom} width={50} height={50} style={{ objectFit: "cover", borderRadius: 6 }} />
                    : <span className="dash-no-img">—</span>
                  }
                </td>
                <td>{ex.nom}</td>
                <td>{ex.description || "—"}</td>
                <td>{ex.prix.toFixed(2)} €</td>
                <td>
                  <button className={`badge badge-toggle ${ex.disponible ? "badge-payee" : "badge-annulee"}`}
                    onClick={() => toggleDispo(ex)} title="Cliquer pour changer">
                    {ex.disponible ? "Dispo" : "Indispo"}
                  </button>
                </td>
                <td className="dash-actions">
                  <button className="dash-btn dash-btn-sm" onClick={() => startEdit(ex)}>Modifier</button>
                  <button className="dash-btn dash-btn-sm dash-btn-danger" onClick={() => handleDelete(ex.id)}>Supprimer</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="dash-section">
        <h2 className="dash-subtitle">Ajouter un extra</h2>
        <form className="dash-form" onSubmit={handleAdd}>
          <div className="dash-form-row">
            <div className="dash-field">
              <label className="dash-label">Nom</label>
              <input className="dash-input" required value={newData.nom}
                onChange={e => setNewData({ ...newData, nom: e.target.value })} />
            </div>
            <div className="dash-field">
              <label className="dash-label">Prix (€)</label>
              <input className="dash-input" type="number" step="0.01" required value={newData.prix}
                onChange={e => setNewData({ ...newData, prix: e.target.value })} />
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
            {saving ? "Ajout..." : "Ajouter l'extra"}
          </button>
        </form>
      </div>
    </div>
  )
}
