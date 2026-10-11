"use client"
import { useLang } from "@/context/LangContext"
import { useReglages } from "@/context/ReglagesContext"

// Bandeau affiché en bas de page quand le traiteur a suspendu les commandes.
//
// Rend null le reste du temps : le composant peut donc être posé sans
// condition à la fin de chaque page publique, sans alourdir le cas normal.
//
// À placer EN DERNIER dans la page — voir la réserve d'espace ci-dessous.
export default function BanniereCommandes() {
  const { commandesOuvertes, messagePause } = useReglages()
  const { t } = useLang()

  if (commandesOuvertes) return null

  const contenu = (
    <div className="banniere-pause-in">
      <strong>{t.pause.titre}</strong>
      {/* Le mot du traiteur est saisi librement au dashboard : il s'affiche
          tel quel, dans sa langue d'origine. Seule la phrase standard qui
          l'entoure est traduite. */}
      {messagePause && <span className="banniere-pause-mot">{messagePause}</span>}
      <span className="banniere-pause-texte">{t.pause.explication}</span>
      <a href="/#contact" className="banniere-pause-lien">{t.pause.contact}</a>
    </div>
  )

  return (
    <>
      {/* Réserve d'espace.
          Le bandeau est en position: fixed, donc hors du flux : sans ce
          doublon, il recouvrirait en permanence le bas de la page — le pied
          de page et ses mentions légales — sans qu'on puisse le dépasser.
          Reproduire le MÊME contenu garantit la même hauteur, quelle que
          soit la longueur du message ou la largeur de l'écran. Une hauteur
          fixe en dur serait fausse dès que le texte passe sur deux lignes.
          visibility: hidden (et non display: none) conserve la place ET
          retire le lien de l'ordre de tabulation. */}
      <div className="banniere-pause banniere-pause-reserve" aria-hidden="true">
        {contenu}
      </div>

      {/* role="status" et non "alert" : l'information est importante mais
          ne demande pas d'action immédiate. "alert" interromprait la lecture
          d'un lecteur d'écran, ce qui serait disproportionné pour un bandeau
          présent en permanence. */}
      <div className="banniere-pause banniere-pause-fixe" role="status">
        {contenu}
      </div>
    </>
  )
}
