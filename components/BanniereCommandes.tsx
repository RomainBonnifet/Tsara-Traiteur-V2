"use client"
import { useLang } from "@/context/LangContext"
import { useReglages } from "@/context/ReglagesContext"

// Bandeau affiché quand le traiteur a suspendu les commandes en ligne.
//
// Rend null le reste du temps : le composant peut donc être posé sans
// condition sur chaque page publique, sans alourdir le cas normal.
export default function BanniereCommandes() {
  const { commandesOuvertes, messagePause } = useReglages()
  const { t } = useLang()

  if (commandesOuvertes) return null

  return (
    // role="status" et non "alert" : l'information est importante mais ne
    // demande pas d'action immédiate. "alert" interromprait la lecture d'un
    // lecteur d'écran, ce qui serait disproportionné pour un bandeau
    // présent en permanence sur la page.
    <div className="banniere-pause" role="status">
      <div className="banniere-pause-in">
        <strong>{t.pause.titre}</strong>
        {/* Le mot du traiteur est saisi librement au dashboard : il s'affiche
            tel quel, dans sa langue d'origine. Seule la phrase standard
            qui l'entoure est traduite. */}
        {messagePause && <span className="banniere-pause-mot">{messagePause}</span>}
        <span className="banniere-pause-texte">{t.pause.explication}</span>
        <a href="/#contact" className="banniere-pause-lien">{t.pause.contact}</a>
      </div>
    </div>
  )
}
