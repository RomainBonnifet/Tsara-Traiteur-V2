"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { parUnite } from "@/lib/formule"
import { useLang } from "@/context/LangContext"
import type { Dictionnaire } from "@/lib/i18n/fr"
import { traduireContenu } from "@/lib/i18n/contenu"
import type { Langue } from "@/lib/i18n/config"

// --- Types TypeScript ---
// La forme exacte de ce que renvoie /api/formules.

type Slot = {
  id: number
  nom: string
  quantiteParUnite: number
  articles: { article: { nom: string } }[]
}
type Formule = {
  id: number
  nom: string
  prix: number
  description: string | null
  minPersonnes: number
  unite: string
  miseEnAvant: boolean
  slots: Slot[]
}
type Categorie = { id: number; nom: string; formules: Formule[] }

// Habillage de chaque catégorie. Le contenu (formules, prix, produits) vient
// de la base ; seul ce qui relève du discours commercial est écrit ici.
// Une catégorie absente de ce tableau s'affiche quand même, avec son nom brut :
// si le traiteur en crée une depuis le dashboard, elle apparaît sur le site
// sans intervention de ma part.
//
// La clé doit correspondre EXACTEMENT au nom de la catégorie en base,
// accent compris. Renommer une catégorie depuis le dashboard sans toucher
// à ce tableau lui fait perdre son titre et son introduction — elle
// s'affiche alors avec son nom brut, sans planter.
// Réglages de PRÉSENTATION de chaque catégorie. Volontairement séparés des
// textes, qui vivent désormais dans les dictionnaires (lib/i18n).
//
// La règle : ce qui se traduit va dans le dictionnaire, ce qui relève du
// comportement reste ici. Mettre « montrerChoix » dans un fichier de
// traduction aurait permis de l'activer en anglais et pas en français.
//
// La clé doit correspondre EXACTEMENT au nom de la catégorie en base,
// accent compris. Une catégorie absente s'affiche avec son nom brut.
type Reglage = {
  id: string
  // Afficher sous chaque créneau la liste des articles proposés au choix.
  //
  // Réservé à l'apéro : sur une planche, le choix EST le produit vendu.
  // Sur un petit-déjeuner, choisir entre deux viennoiseries va de soi —
  // l'afficher sur chaque ligne surcharge la carte sans rien apprendre.
  montrerChoix?: boolean
}

const REGLAGES: Record<string, Reglage> = {
  "Petit-déjeuner": { id: "formules" },
  "Apéro": { id: "aperitif", montrerChoix: true },
}

type Habillage = Reglage & { label: string; titre: ReactNode; intro: string }

function habillageDe(categorie: Categorie, t: Dictionnaire): Habillage {
  const reglage = REGLAGES[categorie.nom] ?? { id: `formules-${categorie.id}` }
  const textes = t.formules.categories[categorie.nom]

  // Repli sur le nom brut de la catégorie : une catégorie créée depuis le
  // dashboard s'affiche quand même, sans titre travaillé mais sans planter.
  if (!textes) {
    return { ...reglage, label: categorie.nom, titre: <em>{categorie.nom}</em>, intro: "" }
  }

  return {
    ...reglage,
    label: textes.label,
    titre: (
      <>
        {textes.titre}
        <br />
        <em>{textes.titreEm}</em>
      </>
    ),
    intro: textes.intro,
  }
}

// Sous-ligne d'un créneau à choix : « au choix : charcuterie, fromage ou mixte ».
//
// Au-delà de trois garnitures la liste déborderait de la carte (les boissons
// chaudes du petit-déjeuner en comptent six) : on se contente alors de dire
// qu'un choix existe. Le détail reste à un clic, sur la page de commande.
//
// Un seul article n'est pas un choix : la fonction ne renvoie rien et la
// carte reste telle qu'elle était.
function choixDuSlot(slot: Slot, t: Dictionnaire, langue: Langue) {
  const noms = slot.articles.map((a) =>
    traduireContenu(a.article.nom, langue).trim().toLowerCase()
  )
  if (noms.length < 2) return null
  if (noms.length > 3) return t.formules.auChoix
  // « a, b ou c » : on remplace la DERNIÈRE virgule par « ou », comme on le
  // dirait à l'oral. Le $ ancre la substitution sur la fin de la chaîne.
  return t.formules.auChoixListe + " " + noms.join(", ").replace(/, ([^,]*)$/, " ou $1")
}

// Les saisies du dashboard contiennent parfois des espaces en trop
// (« Continental  »). On normalise à l'affichage plutôt que de faire
// confiance à la donnée.
function propre(texte: string) {
  return texte.replace(/\s+/g, " ").trim()
}

// Intl.NumberFormat applique les conventions françaises : virgule décimale,
// espace insécable avant le symbole. On masque les centimes sur les prix
// ronds (12 €) et on les garde sinon (16,90 €).
function formatPrix(prix: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(prix) ? 0 : 2,
  }).format(prix)
}

export default function Formules() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const { t, langue } = useLang()

  useEffect(() => {
    fetch("/api/formules")
      .then((res) => res.json())
      .then((data: Categorie[]) => setCategories(data))
  }, [])

  // Rattrapage de l'ancre (#formules, #aperitif).
  //
  // Ces sections naissent d'une requête : au premier rendu, categories vaut
  // [] et le composant n'émet RIEN. Quand le navigateur traite l'ancre, juste
  // après la navigation, l'élément visé n'existe donc pas encore. Il renonce
  // sans message — d'où l'arrivée en haut de page. Les sections apparaissent
  // 200 ms plus tard, quand plus rien ne s'intéresse au hash.
  //
  // On refait le défilement soi-même, une seule fois, à l'arrivée des données.
  const ancreTraitee = useRef(false)

  useEffect(() => {
    if (ancreTraitee.current || categories.length === 0) return

    const id = window.location.hash.slice(1)
    if (!id) return

    const cible = document.getElementById(id)
    if (!cible) return

    // Le drapeau est posé AVANT le défilement : sans lui, un clic ultérieur
    // sur un lien d'ancre de la même page verrait cet effet se redéclencher.
    ancreTraitee.current = true

    // requestAnimationFrame laisse le navigateur terminer sa mise en page
    // avant qu'on mesure la position de la cible : juste après le rendu,
    // les hauteurs ne sont pas encore calculées.
    requestAnimationFrame(() => {
      // "instant" et non "smooth" : on ARRIVE sur la page, on ne navigue pas
      // à l'intérieur. globals.css impose scroll-behavior: smooth à <html>,
      // ce qui donnerait un long défilement automatique ressemblant à un bug.
      cible.scrollIntoView({ behavior: "instant", block: "start" })
    })
  }, [categories])

  return (
    <>
      {categories.map((categorie, index) => {
        const habillage = habillageDe(categorie, t)
        // Alternance des fonds : deux sections crème collées se liraient
        // comme un seul bloc. L'alternance se fait sur l'index, donc elle
        // tient quel que soit le nombre de catégories.
        const fond = index % 2 === 1 ? " formules-blanc" : ""

        return (
          <section
            key={categorie.id}
            className={`formules reveal${fond}`}
            id={habillage.id}
          >
            <div className="formules-header">
              <div>
                <div className="section-label">{habillage.label}</div>
                <h2>{habillage.titre}</h2>
              </div>
              <p>{habillage.intro}</p>
            </div>

            {/* Livraison et paiement valent pour toutes les formules du site :
                affichés une seule fois, sur la première section, plutôt que
                répétés à l'identique sous chaque titre. */}
            {index === 0 && (
              <ul className="formules-infos">
                <li className="formules-info">
                  <span className="formules-info-icone" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <div>
                    <p className="formules-info-titre">{t.formules.livraisonTitre}</p>
                    <p className="formules-info-texte">{t.formules.livraisonTexte}</p>
                  </div>
                </li>
                <li className="formules-info">
                  <span className="formules-info-icone" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5.5" width="18" height="13" rx="2" />
                      <path d="M3 10h18M7 15h3" />
                    </svg>
                  </span>
                  <div>
                    <p className="formules-info-titre">{t.formules.paiementTitre}</p>
                    <p className="formules-info-texte">{t.formules.paiementTexte}</p>
                  </div>
                </li>
              </ul>
            )}

            <div className="formules-grid">
              {categorie.formules.map((formule) => (
                <article
                  key={formule.id}
                  className={formule.miseEnAvant ? "formule-card mise-en-avant" : "formule-card"}
                >
                  {formule.miseEnAvant && <span className="formule-badge">{t.formules.badge}</span>}

                  <p className="formule-eyebrow">
                    {propre(
                      formule.description
                        ? traduireContenu(formule.description, langue)
                        : `${t.formules.aPartirDe} ${formule.minPersonnes}`
                    )}
                  </p>

                  <div className="formule-head">
                    {/* Nom NON traduit : c est un nom commercial. */}
                    <h3 className="formule-nom">{propre(formule.nom)}</h3>
                    <p className="formule-prix">
                      {formatPrix(formule.prix)}
                      <span>{parUnite(formule.unite)}</span>
                    </p>
                  </div>

                  <ul className="formule-produits">
                    {formule.slots.map((slot) => {
                      // Calculé une fois plutôt qu'appelé deux fois dans le
                      // JSX (une fois pour tester, une fois pour afficher).
                      const choix = habillage.montrerChoix ? choixDuSlot(slot, t, langue) : null
                      return (
                      <li key={slot.id}>
                        <svg className="formule-check" viewBox="0 0 20 20" aria-hidden="true">
                          <circle cx="10" cy="10" r="10" />
                          <path
                            d="M6 10.3l2.6 2.6L14 7.6"
                            fill="none"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {/* Ce conteneur n'est pas décoratif : le <li> est en
                            display:flex, donc chacun de ses enfants devient
                            une colonne. Sans lui, la sous-ligne « au choix »
                            se placerait À DROITE du nom au lieu de passer
                            dessous. En l'enveloppant avec le texte, le flex
                            ne voit plus que deux colonnes : l'icône et ce
                            bloc, dans lequel le texte s'écoule normalement. */}
                        <div>
                          {/* Quantité EN PRÉFIXE : « 2× Saucisson nature » se
                              lit comme on le dirait à l'oral, et la colonne de
                              chiffres saute aux yeux quand on compare deux
                              cartes côte à côte. Elle n'apparaît qu'au-delà de
                              1 : « 1× Croissant » alourdirait toutes les cartes
                              petit-déjeuner sans rien apprendre au lecteur. */}
                          {slot.quantiteParUnite > 1 && (
                            <span className="formule-produit-qte">{slot.quantiteParUnite}× </span>
                          )}
                          {propre(traduireContenu(slot.nom, langue))}
                          {choix && (
                            <small className="formule-produit-choix">{choix}</small>
                          )}
                        </div>
                      </li>
                      )
                    })}
                  </ul>

                  <Link
                    href={`/commander/${formule.id}`}
                    className={
                      formule.miseEnAvant
                        ? "btn-lime formule-card-cta"
                        : "formule-cta formule-card-cta"
                    }
                  >
                    {t.formules.cta}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h13M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
