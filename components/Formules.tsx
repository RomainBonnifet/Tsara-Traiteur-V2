"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

// --- Types TypeScript ---
// On décrit la forme exacte des données qu'on attend de l'API.
// Si on essaie d'accéder à une propriété inexistante, TypeScript nous prévient.

type Article = { id: number; nom: string }
type SlotArticle = { article: Article }
type Slot = { id: number; nom: string; articles: SlotArticle[] }
type FormuleDetail = { id: number; nom: string; prix: number; slots: Slot[] }
type Formule = { id: number; nom: string; prix: number }
type Categorie = { id: number; nom: string; formules: Formule[] }

export default function Formules() {
  // Liste des catégories récupérées au chargement (tableau vide par défaut)
  const [categories, setCategories] = useState<Categorie[]>([])

  // L'id de la formule actuellement ouverte (null = aucune)
  const [openFormule, setOpenFormule] = useState<number | null>(null)

  // Cache des détails déjà chargés : { 1: {...}, 3: {...} }
  // Évite de re-fetcher si l'user ouvre/ferme plusieurs fois la même formule
  const [details, setDetails] = useState<Record<number, FormuleDetail>>({})

  // useEffect avec [] = s'exécute une seule fois, au montage du composant
  // C'est ici qu'on charge la liste initiale des catégories + formules
  useEffect(() => {
    fetch("/api/formules")
      .then((res) => res.json())
      .then((data) => setCategories(data))
  }, [])

  // Appelé quand l'user clique sur une formule
  async function toggleFormule(id: number) {
    // Si la formule cliquée est déjà ouverte, on la ferme
    if (openFormule === id) {
      setOpenFormule(null)
      return
    }

    // Sinon on l'ouvre
    setOpenFormule(id)

    // Et si on n'a pas encore chargé son détail, on le fetch maintenant (lazy loading)
    if (!details[id]) {
      const res = await fetch(`/api/formules/${id}`)
      const data = await res.json()
      // On ajoute au cache sans écraser les autres : { ...prev, [id]: data }
      setDetails((prev) => ({ ...prev, [id]: data }))
    }
  }

  return (
    <section className="formules reveal" id="formules">
      <div className="formules-header">
        <div className="section-label">Nos offres</div>
        <h2>
          Choisissez votre <em>formule</em>
        </h2>
        <p>Conçues pour s&apos;adapter à chaque occasion</p>
      </div>

      <div className="formules-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="formule-card">
            <div className="formule-body">
              <h3>{cat.nom}</h3>

              <ul className="formule-list">
                {cat.formules.map((formule) => (
                  <li key={formule.id} className="formule-item">

                    {/* Bouton qui ouvre/ferme le détail de la formule */}
                    <button
                      className={`formule-toggle ${openFormule === formule.id ? "open" : ""}`}
                      onClick={() => toggleFormule(formule.id)}
                    >
                      <span className="formule-toggle-nom">{formule.nom}</span>
                      <span className="formule-toggle-prix">
                        {formule.prix.toFixed(2)} € / pers.
                      </span>
                      <span className="formule-toggle-arrow">
                        {openFormule === formule.id ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* Détail affiché uniquement si cette formule est ouverte ET que les données sont chargées */}
                    {openFormule === formule.id && details[formule.id] && (
                      <div className="formule-detail">
                        {details[formule.id].slots.map((slot) => (
                          <div key={slot.id} className="formule-slot">
                            <strong>{slot.nom}</strong>
                            <ul>
                              {slot.articles.map((sa) => (
                                <li key={sa.article.id}>{sa.article.nom}</li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        <Link
                          href={`/commander/${formule.id}`}
                          className="formule-cta"
                        >
                          Choisir cette formule
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
