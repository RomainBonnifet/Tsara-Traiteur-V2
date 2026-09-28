"use client"

// Page d'édition complète d'une formule.
// Permet de modifier les infos de base, gérer les slots et les articles de chaque slot.

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { UNITES_FORMULE, libelleUnite } from "@/lib/formule"

// --- Types ---
// On décrit la forme des données qu'on reçoit de l'API

type Article = {
  id: number
  nom: string
  description: string | null
  disponible: boolean
}

type SlotArticle = {
  slotId: number
  articleId: number
  article: Article
}

type Slot = {
  id: number
  nom: string
  capacite: number
  quantiteParUnite: number
  position: number
  formuleId: number
  articles: SlotArticle[]
}

type Formule = {
  id: number
  nom: string
  prix: number
  description: string | null
  minPersonnes: number
  pasPersonnes: number
  unite: string
  miseEnAvant: boolean
  categorieId: number
  categorie: { id: number; nom: string }
  slots: Slot[]
}

export default function EditFormulePage() {
  // useParams() récupère les paramètres dynamiques de l'URL (ici [id])
  const params = useParams()
  const id = params.id as string

  const [formule, setFormule] = useState<Formule | null>(null)
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // Champs pour la section "Infos de base"
  const [infoData, setInfoData] = useState({ nom: "", prix: "", description: "", minPersonnes: "1", pasPersonnes: "1", unite: "personne", miseEnAvant: false })
  const [infoSaving, setInfoSaving] = useState(false)
  const [infoMessage, setInfoMessage] = useState("")

  // Champ pour ajouter un nouveau slot
  const [newSlotNom, setNewSlotNom] = useState("")
  const [slotAdding, setSlotAdding] = useState(false)

  // Pour chaque slot, on garde l'état du champ "renommer" dans un objet { [slotId]: string }
  const [slotNames, setSlotNames] = useState<Record<number, string>>({})
  // Pour chaque slot, la capacité éditable
  const [slotCapacites, setSlotCapacites] = useState<Record<number, string>>({})
  // Et le nombre d'exemplaires par personne / par formule.
  const [slotQuantites, setSlotQuantites] = useState<Record<number, string>>({})
  const [slotsSaving, setSlotsSaving] = useState(false)

  // Pour chaque slot, l'article sélectionné dans le <select> d'ajout
  const [selectedArticle, setSelectedArticle] = useState<Record<number, string>>({})

  const [toast, setToast] = useState("")

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  // Chargement initial : on récupère la formule ET tous les articles en parallèle
  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/formules/${id}`).then((r) => r.json()),
      fetch("/api/admin/articles").then((r) => r.json()),
    ]).then(([formulaData, articlesData]) => {
      setAllArticles(articlesData)
      appliquerFormule(formulaData)
      // On pré-remplit les champs infos avec les valeurs actuelles
      setInfoData({
        nom: formulaData.nom,
        prix: String(formulaData.prix),
        description: formulaData.description || "",
        minPersonnes: String(formulaData.minPersonnes ?? 1),
        pasPersonnes: String(formulaData.pasPersonnes ?? 1),
        unite: formulaData.unite ?? "personne",
        miseEnAvant: Boolean(formulaData.miseEnAvant),
      })
      setLoading(false)
    })
  }, [id])

  // Recharge l'écran à partir d'une formule fraîchement lue en base.
  //
  // Les trois tables d'état (noms, quantités, partage) sont des COPIES
  // éditables des valeurs de la base. On les réinitialise ensemble, sinon un
  // champ garderait une valeur que la base ne contient plus.
  //
  // Volontairement PAS appelé après un déplacement de créneau : cela
  // effacerait les saisies en cours, pas encore enregistrées.
  function appliquerFormule(data: Formule) {
    setFormule(data)
    const names: Record<number, string> = {}
    const caps: Record<number, string> = {}
    const qtes: Record<number, string> = {}
    data.slots.forEach((s) => {
      names[s.id] = s.nom
      caps[s.id] = String(s.capacite ?? 1)
      qtes[s.id] = String(s.quantiteParUnite ?? 1)
    })
    setSlotNames(names)
    setSlotCapacites(caps)
    setSlotQuantites(qtes)
  }

  // --- Section 1 : Sauvegarder les infos de base ---
  async function handleSaveInfo() {
    setInfoSaving(true)
    setInfoMessage("")

    const res = await fetch(`/api/admin/formules/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: infoData.nom,
        prix: parseFloat(infoData.prix),
        description: infoData.description,
        minPersonnes: parseInt(infoData.minPersonnes),
        pasPersonnes: parseInt(infoData.pasPersonnes),
        unite: infoData.unite,
        miseEnAvant: infoData.miseEnAvant,
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      // On met à jour localement : on garde les slots, on remplace juste les infos de base
      setFormule((prev) => prev ? { ...prev, nom: updated.nom, prix: updated.prix, description: updated.description, unite: updated.unite, miseEnAvant: updated.miseEnAvant } : prev)
      setInfoMessage("Formule sauvegardée.")
    } else {
      setInfoMessage("Erreur lors de la sauvegarde.")
    }
    setInfoSaving(false)
  }

  // --- Section 2 : Déplacer un slot ---
  async function handleMoveSlot(slotId: number, direction: "up" | "down") {
    const res = await fetch(`/api/admin/slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    })
    if (res.ok) {
      // On recharge la formule pour avoir le nouvel ordre
      const updated = await fetch(`/api/admin/formules/${id}`).then(r => r.json())
      setFormule(updated)
    }
  }

  // --- Section 2 : Enregistrer TOUS les créneaux modifiés ---
  //
  // Remplace le bouton « Sauver » que portait chaque créneau : après avoir
  // corrigé trois noms, il fallait penser à cliquer sur les trois bons
  // boutons, et une modification oubliée disparaissait sans avertissement.
  async function handleSaveSlots() {
    if (!formule) return

    // Valeur affichée d'un créneau : la saisie en cours si elle existe,
    // sinon celle de la base. Le repli DOIT venir du créneau et non d'un "1"
    // en dur : un créneau absent des tables d'état verrait sinon sa capacité
    // réelle écrasée par 1.
    const saisie = (slot: Slot) => ({
      nom: slotNames[slot.id] ?? slot.nom,
      capacite: slotCapacites[slot.id] ?? String(slot.capacite ?? 1),
      quantiteParUnite: slotQuantites[slot.id] ?? String(slot.quantiteParUnite ?? 1),
    })

    // On n'envoie que ce qui a changé : autant de requêtes épargnées qu'il y
    // a de créneaux intacts.
    const modifies = formule.slots.filter((slot) => {
      const v = saisie(slot)
      return v.nom !== slot.nom ||
        v.capacite !== String(slot.capacite ?? 1) ||
        v.quantiteParUnite !== String(slot.quantiteParUnite ?? 1)
    })

    if (modifies.length === 0) {
      showToast("Aucune modification à enregistrer.")
      return
    }

    if (modifies.some((slot) => !saisie(slot).nom.trim())) {
      showToast("Un créneau ne peut pas avoir un nom vide.")
      return
    }

    setSlotsSaving(true)

    // Promise.all : les requêtes partent ensemble au lieu de s'enchaîner.
    const reponses = await Promise.all(
      modifies.map((slot) =>
        fetch(`/api/admin/slots/${slot.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(saisie(slot)),
        })
      )
    )
    const echecs = reponses.filter((r) => !r.ok).length

    // On relit la formule au lieu de recomposer l'état à la main : l'écran
    // affiche alors exactement ce que contient la base, y compris ce que le
    // serveur a corrigé (une quantité à 0 est ramenée à 1).
    const rechargee = await fetch(`/api/admin/formules/${id}`).then((r) => r.json())
    appliquerFormule(rechargee)

    setSlotsSaving(false)
    const n = modifies.length - echecs
    showToast(echecs === 0
      ? `${n} créneau${n > 1 ? "x" : ""} enregistré${n > 1 ? "s" : ""}.`
      : `${echecs} créneau(x) n'ont pas pu être enregistrés.`)
  }

  // --- Section 2 : Supprimer un slot ---
  async function handleDeleteSlot(slotId: number) {
    if (!confirm("Supprimer ce slot ? Les articles associés seront retirés.")) return

    const res = await fetch(`/api/admin/slots/${slotId}`, { method: "DELETE" })

    if (res.ok) {
      setFormule((prev) => {
        if (!prev) return prev
        return { ...prev, slots: prev.slots.filter((s) => s.id !== slotId) }
      })
      showToast("Slot supprimé.")
    } else {
      showToast("Erreur lors de la suppression du slot.")
    }
  }

  // --- Section 2 : Retirer un article d'un slot ---
  async function handleRemoveArticle(slotId: number, articleId: number) {
    const res = await fetch(`/api/admin/slots/${slotId}/articles/${articleId}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setFormule((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          slots: prev.slots.map((s) =>
            s.id === slotId
              ? { ...s, articles: s.articles.filter((a) => a.articleId !== articleId) }
              : s
          ),
        }
      })
    } else {
      showToast("Erreur lors du retrait de l'article.")
    }
  }

  // --- Section 2 : Ajouter un article à un slot ---
  async function handleAddArticle(slotId: number) {
    const articleId = selectedArticle[slotId]
    if (!articleId) return

    const res = await fetch(`/api/admin/slots/${slotId}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: parseInt(articleId) }),
    })

    if (res.ok) {
      // On retrouve l'objet article complet pour l'afficher immédiatement
      const article = allArticles.find((a) => a.id === parseInt(articleId))
      if (!article) return

      const newSlotArticle: SlotArticle = { slotId, articleId: parseInt(articleId), article }

      setFormule((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          slots: prev.slots.map((s) =>
            s.id === slotId ? { ...s, articles: [...s.articles, newSlotArticle] } : s
          ),
        }
      })
      // On remet le select à vide pour ce slot
      setSelectedArticle((prev) => ({ ...prev, [slotId]: "" }))
    } else {
      showToast("Erreur lors de l'ajout de l'article.")
    }
  }

  // --- Section 3 : Ajouter un nouveau slot ---
  async function handleAddSlot() {
    if (!newSlotNom.trim()) return
    setSlotAdding(true)

    const res = await fetch(`/api/admin/formules/${id}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: newSlotNom }),
    })

    if (res.ok) {
      const newSlot: Slot = await res.json()
      setFormule((prev) => {
        if (!prev) return prev
        return { ...prev, slots: [...prev.slots, newSlot] }
      })
      // Le nouveau créneau entre dans les TROIS tables d'état, pas
      // seulement celle des noms : sinon ses champs Qté et Partagé
      // afficheraient un repli au lieu de sa valeur réelle.
      setSlotNames((prev) => ({ ...prev, [newSlot.id]: newSlot.nom }))
      setSlotCapacites((prev) => ({ ...prev, [newSlot.id]: String(newSlot.capacite ?? 1) }))
      setSlotQuantites((prev) => ({ ...prev, [newSlot.id]: String(newSlot.quantiteParUnite ?? 1) }))
      setNewSlotNom("")
      showToast("Slot ajouté.")
    } else {
      showToast("Erreur lors de l'ajout du slot.")
    }
    setSlotAdding(false)
  }

  if (loading) return <div className="dash-loading">Chargement...</div>
  if (!formule) return <div className="dash-loading">Formule introuvable.</div>

  return (
    <>
    <div>
      {/* Lien retour */}
      <Link href="/dashboard/formules" style={{ color: "var(--vert-clair)", fontSize: ".85rem", textDecoration: "none" }}>
        ← Retour aux formules
      </Link>

      <h1 className="dash-title" style={{ marginTop: "1rem" }}>
        Éditer : {formule.nom}
      </h1>


      {/* ── Section 1 : Infos de base ── */}
      <div className="dash-section">
        <h2 className="dash-subtitle">Informations de base</h2>
        <div className="dash-form">
          <div className="dash-form-row">
            <div className="dash-field">
              <label className="dash-label">Nom</label>
              <input
                className="dash-input"
                value={infoData.nom}
                onChange={(e) => setInfoData({ ...infoData, nom: e.target.value })}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">Prix (€)</label>
              <input
                className="dash-input"
                type="number"
                step="0.01"
                value={infoData.prix}
                onChange={(e) => setInfoData({ ...infoData, prix: e.target.value })}
              />
            </div>
          </div>
          <div className="dash-field">
            <label className="dash-label">Description</label>
            <input
              className="dash-input"
              value={infoData.description}
              onChange={(e) => setInfoData({ ...infoData, description: e.target.value })}
            />
          </div>
          <div className="dash-form-row">
            <div className="dash-field">
              <label className="dash-label">Vendue par</label>
              <select
                className="dash-input"
                value={infoData.unite}
                onChange={(e) => setInfoData({ ...infoData, unite: e.target.value })}
              >
                {UNITES_FORMULE.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="dash-field">
              <label className="dash-label">
                Minimum ({libelleUnite(infoData.unite, 2)})
              </label>
              <input
                className="dash-input"
                type="number"
                min="1"
                value={infoData.minPersonnes}
                onChange={(e) => setInfoData({ ...infoData, minPersonnes: e.target.value })}
              />
            </div>
            <div className="dash-field">
              <label className="dash-label">Pas d&apos;incrémentation</label>
              <input
                className="dash-input"
                type="number"
                min="1"
                value={infoData.pasPersonnes}
                onChange={(e) => setInfoData({ ...infoData, pasPersonnes: e.target.value })}
              />
            </div>
          </div>
          {/* Une seule formule mise en avant par catégorie : l&apos;API retire
              automatiquement la mise en avant des autres à la sauvegarde. */}
          <label className="dash-checkbox">
            <input
              type="checkbox"
              checked={infoData.miseEnAvant}
              onChange={(e) => setInfoData({ ...infoData, miseEnAvant: e.target.checked })}
            />
            <span>
              Mettre en avant sur la page d&apos;accueil (badge « La plus choisie »)
              <small>Une seule formule par catégorie : cocher celle-ci retire la mise en avant des autres.</small>
            </span>
          </label>
          {infoMessage && <p className="dash-message">{infoMessage}</p>}
          <button className="dash-btn" onClick={handleSaveInfo} disabled={infoSaving}>
            {infoSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* ── Section 2 : Slots existants ── */}
      <div className="dash-section">
        <h2 className="dash-subtitle">Slots de la formule</h2>

        {formule.slots.length === 0 && (
          <p style={{ color: "var(--brun-clair)", fontSize: ".9rem" }}>
            Aucun slot pour l&apos;instant. Ajoutez-en un ci-dessous.
          </p>
        )}

        {formule.slots.map((slot) => {
          // Les articles déjà dans ce slot (leurs ids)
          const idsDejaPresents = slot.articles.map((a) => a.articleId)

          // Les articles qu'on peut encore ajouter (ceux qui ne sont pas déjà dans le slot)
          const articlesDisponibles = allArticles.filter(
            (a) => !idsDejaPresents.includes(a.id)
          )

          return (
            <div key={slot.id} className="slot-card">
              {/* En-tête : champ renommage + boutons */}
              <div className="slot-card-header">
                <button
                  className="dash-btn dash-btn-sm dash-btn-neutral"
                  onClick={() => handleMoveSlot(slot.id, "up")}
                  title="Monter"
                >▲</button>
                <button
                  className="dash-btn dash-btn-sm dash-btn-neutral"
                  onClick={() => handleMoveSlot(slot.id, "down")}
                  title="Descendre"
                >▼</button>
                <input
                  className="dash-input"
                  style={{ flex: 1, minWidth: 0 }}
                  value={slotNames[slot.id] ?? slot.nom}
                  onChange={(e) =>
                    setSlotNames((prev) => ({ ...prev, [slot.id]: e.target.value }))
                  }
                />
                <div className="dash-field" style={{ flexShrink: 0 }}>
                  <label className="dash-label" style={{ fontSize: ".7rem" }} title="Nombre d'exemplaires par personne ou par formule. 3 = trois saucissons par formule.">
                    Qté / unité
                  </label>
                  <input
                    className="dash-input"
                    type="number"
                    min="1"
                    style={{ width: "70px" }}
                    title="Nombre d'exemplaires par personne ou par formule. 3 = trois saucissons par formule."
                    value={slotQuantites[slot.id] ?? String(slot.quantiteParUnite ?? 1)}
                    onChange={(e) =>
                      setSlotQuantites((prev) => ({ ...prev, [slot.id]: e.target.value }))
                    }
                  />
                </div>
                <div className="dash-field" style={{ flexShrink: 0 }}>
                  <label className="dash-label" style={{ fontSize: ".7rem" }} title="Nombre de personnes servies par une unité. 4 = une bouteille d'un litre pour quatre personnes. Laisser à 1 dans le doute.">
                    Partagé entre
                  </label>
                  <input
                    className="dash-input"
                    type="number"
                    min="1"
                    style={{ width: "70px" }}
                    title="Nombre de personnes servies par une unité. 4 = une bouteille d'un litre pour quatre personnes. Laisser à 1 dans le doute."
                    value={slotCapacites[slot.id] ?? String(slot.capacite ?? 1)}
                    onChange={(e) =>
                      setSlotCapacites((prev) => ({ ...prev, [slot.id]: e.target.value }))
                    }
                  />
                </div>
                <button
                  className="dash-btn dash-btn-sm dash-btn-danger"
                  onClick={() => handleDeleteSlot(slot.id)}
                >
                  Supprimer le slot
                </button>
              </div>

              {/* Liste des articles dans ce slot */}
              <div className="slot-articles-list">
                {slot.articles.length === 0 && (
                  <span style={{ fontSize: ".8rem", color: "var(--brun-clair)" }}>
                    Aucun article dans ce slot.
                  </span>
                )}
                {slot.articles.map((sa) => (
                  <span key={sa.articleId} className="slot-article-tag">
                    {sa.article.nom}
                    <button
                      onClick={() => handleRemoveArticle(slot.id, sa.articleId)}
                      title="Retirer cet article"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Ajout d'un article */}
              <div className="slot-add-article">
                <select
                  className="dash-input"
                  value={selectedArticle[slot.id] ?? ""}
                  onChange={(e) =>
                    setSelectedArticle((prev) => ({ ...prev, [slot.id]: e.target.value }))
                  }
                >
                  <option value="">— Choisir un article —</option>
                  {articlesDisponibles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nom}
                    </option>
                  ))}
                </select>
                <button
                  className="dash-btn dash-btn-sm"
                  onClick={() => handleAddArticle(slot.id)}
                  disabled={!selectedArticle[slot.id]}
                >
                  Ajouter
                </button>
              </div>
            </div>
          )
        })}

        {formule.slots.length > 0 && (
          <div className="dash-slots-actions">
            <button
              className="dash-btn"
              onClick={handleSaveSlots}
              disabled={slotsSaving}
            >
              {slotsSaving ? "Enregistrement..." : "Enregistrer les créneaux"}
            </button>
            <span className="dash-slots-note">
              Enregistre les noms, quantités et partages de tous les créneaux.
              L&apos;ordre (▲ ▼) est enregistré immédiatement, sans ce bouton.
            </span>
          </div>
        )}
      </div>

      {/* ── Section 3 : Ajouter un slot ── */}
      <div className="dash-section">
        <h2 className="dash-subtitle">Ajouter un slot</h2>
        <p style={{ fontSize: ".85rem", color: "var(--brun-clair)", marginBottom: ".75rem" }}>
          Un slot représente une catégorie de choix dans la formule (ex : &quot;Boisson chaude&quot;, &quot;Viennoiserie&quot;...).
        </p>
        <div className="dash-form-row">
          <input
            className="dash-input"
            placeholder="Nom du slot"
            value={newSlotNom}
            onChange={(e) => setNewSlotNom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddSlot() }}
          />
          <button
            className="dash-btn"
            onClick={handleAddSlot}
            disabled={slotAdding || !newSlotNom.trim()}
          >
            {slotAdding ? "Ajout..." : "Ajouter le slot"}
          </button>
        </div>
      </div>
    </div>

    {toast && (
      <div className="dash-toast">
        <span>✓</span> {toast}
      </div>
    )}
    </>
  )
}
