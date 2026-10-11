"use client"

// Gestion des catégories.
//
// Trois réglages qui n'étaient jusqu'ici modifiables que par un script lancé
// à la main, donc en pratique par le développeur :
//   - le nom affiché,
//   - la visibilité sur le site public,
//   - les créneaux de livraison proposés.
//
// Pas de création ni de suppression ici, volontairement : une catégorie
// structure tout le catalogue (formules, extras, commandes passées). En
// supprimer une depuis un tableau, entre deux clics, serait trop facile.
// Cela reste une opération rare, qui passe par une migration.

import { useEffect, useState } from "react"
import { CRENEAUX_DEFAUT } from "@/lib/creneaux"

type Categorie = {
  id: number
  nom: string
  visiblePublic: boolean
  creneaux: string[]
  _count: { formules: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  // Brouillons de saisie, par catégorie. Comme ailleurs dans le dashboard,
  // ce sont des copies éditables : la liste `categories` ne reflète que ce
  // qui est réellement en base.
  const [noms, setNoms] = useState<Record<number, string>>({})
  const [creneaux, setCreneaux] = useState<Record<number, string>>({})

  function appliquer(liste: Categorie[]) {
    setCategories(liste)
    const n: Record<number, string> = {}
    const c: Record<number, string> = {}
    liste.forEach((cat) => {
      n[cat.id] = cat.nom
      // Un créneau par ligne : plus lisible qu'une liste séparée par des
      // virgules, et une virgule peut légitimement figurer dans un horaire.
      c[cat.id] = cat.creneaux.join("\n")
    })
    setNoms(n)
    setCreneaux(c)
  }

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(appliquer)
      .finally(() => setLoading(false))
  }, [])

  function afficherMessage(texte: string) {
    setMessage(texte)
    setTimeout(() => setMessage(""), 4000)
  }

  async function enregistrer(cat: Categorie, modifications: Partial<Categorie>) {
    setSaving(cat.id)

    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modifications),
    })

    if (res.ok) {
      const maj: Categorie = await res.json()
      // On réinjecte la réponse du serveur plutôt que les valeurs saisies :
      // il a nettoyé les créneaux (espaces, doublons, lignes vides), et
      // l'écran doit montrer ce qui est vraiment enregistré.
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? maj : c)))
      setNoms((prev) => ({ ...prev, [cat.id]: maj.nom }))
      setCreneaux((prev) => ({ ...prev, [cat.id]: maj.creneaux.join("\n") }))
      afficherMessage(`« ${maj.nom} » enregistrée.`)
    } else {
      const data = await res.json().catch(() => ({}))
      afficherMessage(data.error ?? "Erreur lors de l'enregistrement.")
    }

    setSaving(null)
  }

  function basculerVisibilite(cat: Categorie) {
    // Masquer une catégorie retire ses formules du site ET empêche de les
    // commander. On le dit avant, avec le nombre de formules concernées :
    // c'est la différence entre un réglage et une fermeture de boutique.
    if (cat.visiblePublic && cat._count.formules > 0) {
      const ok = confirm(
        `Masquer « ${cat.nom} » ?\n\n` +
        `Ses ${cat._count.formules} formule(s) disparaîtront du site public et ` +
        `ne pourront plus être commandées en ligne.\n\n` +
        `Elles restent en base : le dashboard et les commandes déjà passées ` +
        `ne sont pas touchés.`
      )
      if (!ok) return
    }
    enregistrer(cat, { visiblePublic: !cat.visiblePublic })
  }

  if (loading) return <div className="dash-loading">Chargement...</div>

  return (
    <div>
      <h1 className="dash-title">Catégories</h1>
      <p className="dash-intro">
        Une catégorie regroupe des formules et détermine leurs créneaux de
        livraison. La création et la suppression passent par une migration :
        elles touchent tout le catalogue.
      </p>
      {message && <p className="dash-message">{message}</p>}

      {categories.map((cat) => (
        <div key={cat.id} className="dash-detail-card dash-categorie">

          <div className="dash-categorie-tete">
            <input
              className="dash-input"
              value={noms[cat.id] ?? cat.nom}
              onChange={(e) => setNoms((p) => ({ ...p, [cat.id]: e.target.value }))}
              aria-label={`Nom de la catégorie ${cat.nom}`}
            />
            <span className="dash-categorie-compte">
              {cat._count.formules} formule{cat._count.formules > 1 ? "s" : ""}
            </span>
            <button
              className={`badge badge-toggle ${cat.visiblePublic ? "badge-payee" : "badge-annulee"}`}
              onClick={() => basculerVisibilite(cat)}
              disabled={saving === cat.id}
              title="Cliquer pour changer la visibilité sur le site public"
            >
              {cat.visiblePublic ? "Visible sur le site" : "Masquée"}
            </button>
          </div>

          {/* Avertissement sur le renommage : le site indexe ses textes de
              présentation par le NOM de la catégorie. Le traiteur ne peut pas
              le deviner, donc on le lui dit à l'endroit où il s'apprête à
              faire la bêtise. */}
          {(noms[cat.id] ?? cat.nom) !== cat.nom && (
            <p className="dash-avertissement">
              Renommer une catégorie lui fait perdre son titre et son texte
              d&apos;introduction sur la page d&apos;accueil, jusqu&apos;à ce
              que le développeur les reporte. Le reste continue de fonctionner.
            </p>
          )}

          <div className="dash-field">
            <label className="dash-label" htmlFor={`creneaux-${cat.id}`}>
              Créneaux de livraison — un par ligne
            </label>
            <textarea
              id={`creneaux-${cat.id}`}
              className="dash-input dash-textarea"
              rows={4}
              placeholder={CRENEAUX_DEFAUT.join("\n")}
              value={creneaux[cat.id] ?? ""}
              onChange={(e) => setCreneaux((p) => ({ ...p, [cat.id]: e.target.value }))}
            />
            <span className="dash-aide">
              {cat.creneaux.length === 0
                ? `Aucun créneau défini : le site propose les horaires par défaut (${CRENEAUX_DEFAUT.join(", ")}).`
                : "Ces horaires sont proposés au client pour les formules de cette catégorie."}
            </span>
          </div>

          <button
            className="dash-btn"
            disabled={saving === cat.id}
            onClick={() =>
              enregistrer(cat, {
                nom: noms[cat.id] ?? cat.nom,
                // split sur les sauts de ligne : le serveur se charge de
                // retirer les lignes vides et les doublons.
                creneaux: (creneaux[cat.id] ?? "").split("\n"),
              })
            }
          >
            {saving === cat.id ? "Enregistrement..." : "Enregistrer"}
          </button>

        </div>
      ))}
    </div>
  )
}
