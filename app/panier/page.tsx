"use client"
import Link from "next/link"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { libelleUnite, uniteCourte } from "@/lib/formule"
import { creneauxDe } from "@/lib/creneaux"
import { useLang } from "@/context/LangContext"
import { traduireContenu } from "@/lib/i18n/contenu"

// Doit rester cohérent avec la regex de /api/checkout.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PanierPage() {
  const { items, removeItem, total, clearCart } = useCart()
  const { user } = useAuth()
  const { t, langue } = useLang()
  const [loading, setLoading] = useState(false)

  // Un créneau PAR CATÉGORIE présente dans le panier : { categorieId → choix }.
  // Un petit-déjeuner se livre le matin, un plateau apéro le soir — une
  // commande mixte demande donc deux horaires, pas un compromis entre les deux.
  const [creneauxChoisis, setCreneauxChoisis] = useState<Record<number, string>>({})

  const [livraison, setLivraison] = useState({ email: "", telephone: "", dates: [] as string[], adresse: "", remarque: "" })
  // Date en cours de saisie, tant qu'elle n'a pas été ajoutée à la liste.
  const [nouvelleDate, setNouvelleDate] = useState("")
  const [adresseStatut, setAdresseStatut] = useState<"idle" | "checking" | "ok" | "error">("idle")
  const [adresseMessage, setAdresseMessage] = useState("")
  const [erreur, setErreur] = useState("")
  // Mode de paiement choisi. En ligne par défaut, comme avant l'ajout du choix.
  const [modePaiement, setModePaiement] = useState<"en_ligne" | "livraison">("en_ligne")

  // Les catégories présentes dans le panier, dédoublonnées, avec leurs
  // créneaux. Deux formules de la même catégorie partagent un seul horaire :
  // c'est une seule livraison.
  const categoriesDuPanier = useMemo(() => {
    const parId = new Map<number, { id: number; nom: string; creneaux: string[] }>()
    for (const item of items) {
      if (!parId.has(item.categorieId)) {
        parId.set(item.categorieId, {
          id: item.categorieId,
          nom: item.categorieNom,
          creneaux: creneauxDe(item.creneaux),
        })
      }
    }
    // Array.from et non [...spread] : l iteration d un Map par spread exige
    // une cible ES2015+, que tsconfig ne fixe pas ici.
    return Array.from(parId.values())
  }, [items])

  const aujourdhui = new Date().toISOString().split("T")[0]
  // Une livraison est préparée par date : le panier est donc facturé
  // autant de fois qu'il y a de jours choisis.
  const nbJours = livraison.dates.length

  function ajouterDate() {
    const d = nouvelleDate
    if (!d || d < aujourdhui || livraison.dates.includes(d)) return
    // Les dates ISO se trient comme du texte : pas besoin de comparateur.
    setLivraison({ ...livraison, dates: [...livraison.dates, d].sort() })
    setNouvelleDate("")
  }

  function retirerDate(d: string) {
    setLivraison({ ...livraison, dates: livraison.dates.filter(x => x !== d) })
  }

  // T12:00:00 plutôt que minuit : selon le fuseau, "2026-09-15" interprété
  // en UTC puis affiché en local pourrait reculer d'un jour.
  function formatDate(iso: string) {
    // La locale conditionne l'ordre des éléments : « lundi 15 septembre » en
    // français, « Monday 15 September » en anglais. Forcer "fr-FR" aurait
    // donné une date française au visiteur anglophone.
    const s = new Date(`${iso}T12:00:00`).toLocaleDateString(
      langue === "en" ? "en-GB" : "fr-FR",
      { weekday: "long", day: "numeric", month: "long" }
    )
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  // Un visiteur connecté fournit son email via son compte ; un invité doit
  // le saisir. Ce contrôle est un confort d'interface : /api/checkout
  // revalide côté serveur, seul endroit où la vérification est fiable.
  const emailValide = !!user || EMAIL_REGEX.test(livraison.email.trim())

  const livraisonValide =
    emailValide &&
    livraison.telephone.trim() !== "" &&
    nbJours > 0 &&
    // Chaque catégorie doit avoir SON créneau : une commande mixte sans
    // horaire pour l'apéro laisserait le traiteur deviner.
    categoriesDuPanier.every((c) => creneauxChoisis[c.id]) &&
    // Toutes les formules sont livrées dans le même rayon depuis la
    // suppression des buffets de groupe : l'adresse doit donc toujours
    // avoir été validée, sans exception.
    adresseStatut === "ok"

  // useCallback avec [livraison.adresse] : la fonction ne change d'identité
  // que lorsque l'adresse change. L'effet de debounce ci-dessous peut donc
  // la déclarer en dépendance sans que son minuteur soit relancé à chaque
  // frappe dans un AUTRE champ du formulaire.
  const validerAdresse = useCallback(async () => {
    if (!livraison.adresse.trim()) return
    setAdresseStatut("checking")
    setAdresseMessage("")
    const res = await fetch("/api/validate-adresse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adresse: livraison.adresse }),
    })
    const data = await res.json()
    if (data.ok) {
      setAdresseStatut("ok")
      setAdresseMessage(`✓ ${data.label}`)
    } else {
      setAdresseStatut("error")
      setAdresseMessage(data.message)
    }
  }, [livraison.adresse])

  useEffect(() => {
    if (!livraison.adresse.trim()) {
      setAdresseStatut("idle")
      setAdresseMessage("")
      return
    }
    const timer = setTimeout(() => validerAdresse(), 500)
    return () => clearTimeout(timer)
  }, [livraison.adresse, validerAdresse])

  if (items.length === 0) {
    return (
      <main className="panier">
        <div className="panier-header">
          <Link href="/#formules" className="commander-back">{t.panier.retour}</Link>
          <h1>{t.panier.titre} <em>{t.panier.titreEm}</em></h1>
        </div>
        <div className="panier-empty">
          <p>{t.panier.vide}</p>
          <Link href="/#formules" className="formule-cta">{t.panier.videCta}</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="panier">
      <div className="panier-header">
        <Link href="/#formules" className="commander-back">{t.panier.retour}</Link>
        <h1>{t.panier.titre} <em>{t.panier.titreEm}</em></h1>
      </div>

      <div className="panier-body">

        {/* ── Liste des items ── */}
        <div className="panier-items">
          {items.map(item => (
            <div key={item.id} className="panier-item">

              <div className="panier-item-header">
                <div>
                  <h2>{item.formuleNom}</h2>
                  <span className="panier-item-meta">
                    {item.nbPersonnes} {libelleUnite(item.unite, item.nbPersonnes, langue)} · {item.formulePrix.toFixed(2)} € / {uniteCourte(item.unite, langue)}
                  </span>
                </div>
                <button
                  className="panier-item-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={t.panier.supprimer}
                >✕</button>
              </div>

              {/* Sélections — une section par créneau, avec sa répartition.
                  reduce regroupe les lignes par nom de créneau : le panier
                  reçoit une liste à plat, mais le client raisonne par
                  catégorie (« Boissons chaudes : 12 cafés, 8 thés »). */}
              {Object.entries(
                item.lignes.reduce<Record<string, typeof item.lignes>>((acc, ligne) => {
                  (acc[ligne.slotNom] ??= []).push(ligne)
                  return acc
                }, {})
              ).map(([slotNom, lignes]) => (
                <div key={slotNom} className="panier-item-details">
                  <p className="summary-section-title">{traduireContenu(slotNom, langue)}</p>
                  {lignes.map(ligne => (
                    <div key={ligne.articleId} className="summary-line">
                      <span>{traduireContenu(ligne.articleNom, langue)}</span>
                      <span>× {ligne.quantite}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Extras */}
              {item.extras.length > 0 && (
                <div className="panier-item-details">
                  <p className="summary-section-title">{t.panier.extras}</p>
                  {item.extras.map(e => (
                    <div key={e.extraId} className="summary-line">
                      <span>{traduireContenu(e.nom, langue)} × {e.quantite}</span>
                      <span>{(e.prix * e.quantite).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="panier-item-subtotal">
                <span>{t.panier.sousTotal}</span>
                <span>{item.subtotal.toFixed(2)} €</span>
              </div>

            </div>
          ))}
        </div>

        {/* ── Récapitulatif final ── */}
        <div className="commander-summary">
          <h2>{t.panier.recapitulatif}</h2>

          {items.map(item => (
            <div key={item.id} className="summary-line">
              <span>{t.panier.formule} {item.formuleNom} × {item.nbPersonnes}</span>
              <span>{item.subtotal.toFixed(2)} €</span>
            </div>
          ))}

          <div className="summary-total">
            {nbJours > 1 && (
              <>
                <div className="summary-line">
                  <span>{t.panier.sousTotalParLivraison}</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="summary-line">
                  <span>× {nbJours} {t.panier.datesDeLivraison}</span>
                  <span></span>
                </div>
              </>
            )}
            <div className="summary-line total">
              <span>{t.panier.total}</span>
              <span>{(total * Math.max(nbJours, 1)).toFixed(2)} €</span>
            </div>
          </div>

          {/* ── Infos de livraison ── */}
          <div className="livraison-form">
            <h3 className="livraison-title">{t.panier.livraisonTitre}</h3>
            {/* L'email est TOUJOURS affiché, connecté ou non.

                Auparavant le bloc entier disparaissait pour un client
                connecté, au motif que son compte fournit déjà l'adresse.
                C'est vrai côté serveur, mais du point de vue du client la
                commande ne demandait plus aucun email : rien n'indiquait où
                sa confirmation allait partir, ni comment le vérifier.

                Connecté, le champ est donc en lecture seule et montre
                l'adresse du compte. Invité, il se saisit. Dans les deux cas
                /api/checkout reste seul juge : il relit l'email du compte en
                base et ignore ce que le navigateur envoie pour un connecté. */}
            <div className="livraison-field">
              <label className="livraison-label" htmlFor="livraison-email">{t.panier.email}</label>
              <input
                id="livraison-email"
                className="livraison-input"
                type="email"
                autoComplete="email"
                placeholder={t.panier.emailPlaceholder}
                readOnly={!!user}
                value={user ? user.email : livraison.email}
                onChange={e => setLivraison({ ...livraison, email: e.target.value })}
              />
              <span className="livraison-hint">
                {user ? t.panier.emailAideCompte : t.panier.emailAideInvite}
              </span>
            </div>
            <div className="livraison-field">
              <label className="livraison-label">{t.panier.telephone}</label>
              <input
                className="livraison-input"
                type="tel"
                placeholder={t.panier.telephonePlaceholder}
                value={livraison.telephone}
                onChange={e => setLivraison({ ...livraison, telephone: e.target.value })}
              />
            </div>
            <div className="livraison-field">
              <label className="livraison-label" htmlFor="livraison-date">
                {t.panier.dates}
              </label>
              <div className="dates-ajout">
                <input
                  id="livraison-date"
                  className="livraison-input"
                  type="date"
                  min={aujourdhui}
                  value={nouvelleDate}
                  onChange={e => setNouvelleDate(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); ajouterDate() }
                  }}
                />
                <button
                  type="button"
                  className="dates-ajout-btn"
                  onClick={ajouterDate}
                  disabled={!nouvelleDate || livraison.dates.includes(nouvelleDate)}
                >
                  {t.panier.ajouterDate}
                </button>
              </div>
              {nbJours > 0 && (
                <ul className="dates-liste">
                  {livraison.dates.map(d => (
                    <li key={d}>
                      {formatDate(d)}
                      <button
                        type="button"
                        onClick={() => retirerDate(d)}
                        aria-label={`${t.panier.retirerDate} ${formatDate(d)}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <span className="livraison-hint">
                {nbJours === 0
                  ? t.panier.datesAideVide
                  : `${nbJours} ${nbJours > 1 ? t.panier.livraisons : t.panier.livraison} — ${t.panier.datesAide}`}
              </span>
            </div>
            {/* Un sélecteur par catégorie. Avec une seule catégorie au
                panier, l'affichage est identique à avant : le nom de la
                catégorie n'apparaît que s'il y a matière à distinguer. */}
            {categoriesDuPanier.map((categorie) => (
              <div className="livraison-field" key={categorie.id}>
                <label className="livraison-label" htmlFor={`creneau-${categorie.id}`}>
                  {categoriesDuPanier.length > 1
                    ? `${t.panier.creneau} — ${traduireContenu(categorie.nom, langue)}`
                    : t.panier.creneau}
                </label>
                <select
                  id={`creneau-${categorie.id}`}
                  className="livraison-input"
                  value={creneauxChoisis[categorie.id] ?? ""}
                  onChange={(e) =>
                    setCreneauxChoisis((prev) => ({ ...prev, [categorie.id]: e.target.value }))
                  }
                >
                  <option value="">{t.panier.creneauVide}</option>
                  {/* value = le créneau EN FRANÇAIS, tel qu'il est en base :
                      c'est lui que /api/checkout valide et que le traiteur
                      lira. Seul l'affichage est traduit. */}
                  {categorie.creneaux.map((c) => (
                    <option key={c} value={c}>{traduireContenu(c, langue)}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="livraison-field">
              <label className="livraison-label">{t.panier.adresse}</label>
              <input
                className={`livraison-input ${adresseStatut === "ok" ? "livraison-input-ok" : adresseStatut === "error" ? "livraison-input-error" : ""}`}
                type="text"
                placeholder={t.panier.adressePlaceholder}
                value={livraison.adresse}
                onChange={e => {
                  setLivraison({ ...livraison, adresse: e.target.value })
                  setAdresseStatut("idle")
                  setAdresseMessage("")
                }}
              />
              {adresseStatut === "checking" && (
                <span className="livraison-hint">{t.panier.adresseVerification}</span>
              )}
              {adresseMessage && (
                <span className={`livraison-hint ${adresseStatut === "ok" ? "livraison-hint-ok" : "livraison-hint-error"}`}>
                  {adresseMessage}
                </span>
              )}
            </div>

            <div className="livraison-field">
              <label className="livraison-label" htmlFor="livraison-remarque">
                {t.panier.remarque}
              </label>
              <textarea
                id="livraison-remarque"
                className="livraison-input livraison-textarea"
                rows={3}
                // maxLength est un confort de saisie, pas une sécurité :
                // /api/checkout tronque de son côté. Le compteur ci-dessous
                // évite au client d'écrire un roman qui serait coupé.
                maxLength={500}
                placeholder={t.panier.remarquePlaceholder}
                value={livraison.remarque}
                onChange={e => setLivraison({ ...livraison, remarque: e.target.value })}
              />
              <span className="livraison-hint">
                {livraison.remarque.length > 0
                  ? `${livraison.remarque.length} / 500 ${t.panier.remarqueCompteur}`
                  : t.panier.remarqueAide}
              </span>
            </div>
          </div>

          {/* ── Mode de paiement ── */}
          <fieldset className="paiement-choix">
            <legend className="livraison-title">{t.panier.paiement}</legend>
            <label className="paiement-option">
              <input
                type="radio"
                name="modePaiement"
                value="en_ligne"
                checked={modePaiement === "en_ligne"}
                onChange={() => setModePaiement("en_ligne")}
              />
              <span>
                <strong>{t.panier.paiementEnLigne}</strong>
                <small>{t.panier.paiementEnLigneAide}</small>
              </span>
            </label>
            <label className="paiement-option">
              <input
                type="radio"
                name="modePaiement"
                value="livraison"
                checked={modePaiement === "livraison"}
                onChange={() => setModePaiement("livraison")}
              />
              <span>
                <strong>{t.panier.paiementLivraison}</strong>
                <small>{t.panier.paiementLivraisonAide}</small>
              </span>
            </label>
          </fieldset>

          <button
            className="summary-cta"
            disabled={loading || !livraisonValide}
            onClick={async () => {
              setLoading(true)
              setErreur("")
              try {
                const res = await fetch("/api/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items,
                    livraison: { ...livraison, creneaux: creneauxChoisis },
                    modePaiement,
                  })
                })
                const data = await res.json()
                // L'API renvoie l'étape suivante : la page de paiement Stripe
                // (en ligne) ou la page de confirmation (à la livraison).
                // On ne remet PAS loading à false dans ce cas : la
                // navigation part, le bouton doit rester inactif.
                if (data.url) {
                  window.location.href = data.url
                  return
                }
                setErreur(data.error ?? t.panier.erreurCommande)
              } catch {
                setErreur(t.panier.erreurConnexion)
              }
              setLoading(false)
            }}
          >
            {loading ? t.panier.chargement : modePaiement === "livraison" ? t.panier.confirmer : t.panier.payer}
          </button>

          {erreur && <p className="livraison-hint livraison-hint-error">{erreur}</p>}

          <button
            className="panier-clear"
            onClick={clearCart}
          >
            {t.panier.vider}
          </button>
        </div>

      </div>
    </main>
  )
}
