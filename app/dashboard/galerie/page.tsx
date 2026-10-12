"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

type Photo = { id: number; url: string; alt: string }

export default function DashboardGaleriePage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [alt, setAlt] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState("")
  // Identifiant de la photo en cours de déplacement : les flèches se
  // désactivent pendant la requête, pour éviter deux clics qui se croisent.
  const [deplacement, setDeplacement] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  useEffect(() => {
    fetch("/api/admin/photos")
      .then(r => r.json())
      .then(setPhotos)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  // Redimensionne l'image côté navigateur avant upload
  // Évite les erreurs 413 (trop lourd) imposées par Vercel (limite 4.5 MB)
  function compressImage(file: File, maxWidth = 2000, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        // On calcule les nouvelles dimensions en gardant le ratio
        const ratio = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement("canvas")
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          quality
        )
      }
      img.src = URL.createObjectURL(file)
    })
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)

    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append("photo", compressed)
    formData.append("alt", alt)

    const res = await fetch("/api/admin/photos", { method: "POST", body: formData })

    if (res.ok) {
      const newPhoto = await res.json()
      setPhotos(prev => [newPhoto, ...prev])
      setFile(null)
      setAlt("")
      setPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      showToast("Photo ajoutée avec succès.")
    } else {
      showToast("Erreur lors de l'upload.")
    }
    setUploading(false)
  }

  async function handleMove(id: number, direction: "up" | "down") {
    setDeplacement(id)

    const res = await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    })

    if (res.ok) {
      // On relit la liste au lieu de permuter le tableau local : le
      // serveur a renuméroté toutes les positions, et l'écran doit
      // montrer ce qu'il a réellement écrit.
      const maj = await fetch("/api/admin/photos").then((r) => r.json())
      setPhotos(maj)
    } else {
      showToast("Erreur lors du déplacement.")
    }

    setDeplacement(null)
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette photo ?")) return
    const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== id))
      showToast("Photo supprimée.")
    }
  }

  return (
    <>
      <div>
        <h1 className="dash-title">Galerie</h1>

        {/* Formulaire d'upload */}
        <div className="dash-section">
          <h2 className="dash-subtitle">Ajouter une photo</h2>
          <form className="galerie-upload-form" onSubmit={handleUpload}>
            <div className="galerie-upload-preview">
              {preview
                // `preview` est une URL locale (blob) issue du champ fichier :
                // l'image n'a jamais quitté le navigateur, next/image n'a rien
                // à optimiser. <img> est ici le choix correct.
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="Aperçu" />
                : <span className="galerie-upload-placeholder">Aperçu</span>
              }
            </div>
            <div className="galerie-upload-fields">
              <div className="dash-field">
                <label className="dash-label">Fichier image</label>
                <input
                  ref={fileInputRef}
                  className="dash-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="dash-field">
                <label className="dash-label">Légende (optionnel)</label>
                <input
                  className="dash-input"
                  type="text"
                  placeholder="Ex : Plateau petit-déjeuner champêtre"
                  value={alt}
                  onChange={e => setAlt(e.target.value)}
                />
              </div>
              <button
                className="dash-btn"
                type="submit"
                disabled={uploading || !file}
              >
                {uploading ? "Upload en cours..." : "Ajouter à la galerie"}
              </button>
            </div>
          </form>
        </div>

        {/* Grille des photos existantes */}
        <div className="dash-section">
          <h2 className="dash-subtitle">Photos en ligne ({photos.length})</h2>
          <p className="dash-aide">
            L&apos;ordre ci-dessous est celui du site. Les cinq premières
            apparaissent sur la page d&apos;accueil, toutes sur la page Galerie.
          </p>
          {photos.length === 0
            ? <p className="dash-empty">Aucune photo pour l&apos;instant.</p>
            : (
              <div className="galerie-admin-grid">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="galerie-admin-item">
                    <div className="galerie-admin-img">
                      <Image
                        src={photo.url}
                        alt={photo.alt || "Photo galerie"}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="200px"
                      />
                    </div>
                    {photo.alt && <p className="galerie-admin-alt">{photo.alt}</p>}

                    <div className="galerie-admin-actions">
                      {/* disabled sur la première et la dernière : un bouton
                          qui ne peut rien faire doit le montrer, pas attendre
                          le clic pour ne rien faire. */}
                      <button
                        className="dash-btn dash-btn-sm dash-btn-neutral"
                        onClick={() => handleMove(photo.id, "up")}
                        disabled={i === 0 || deplacement !== null}
                        title="Monter"
                        aria-label={`Monter la photo ${i + 1}`}
                      >▲</button>
                      <button
                        className="dash-btn dash-btn-sm dash-btn-neutral"
                        onClick={() => handleMove(photo.id, "down")}
                        disabled={i === photos.length - 1 || deplacement !== null}
                        title="Descendre"
                        aria-label={`Descendre la photo ${i + 1}`}
                      >▼</button>
                      <span className="galerie-admin-rang">{i + 1}</span>
                      <button
                        className="dash-btn dash-btn-danger dash-btn-sm"
                        onClick={() => handleDelete(photo.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {toast && <div className="dash-toast">{toast}</div>}
    </>
  )
}
