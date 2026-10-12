import { cookies } from "next/headers"
import fr from "./fr"
import en from "./en"
import { COOKIE_LANGUE, LANGUE_DEFAUT, estLangueValide, type Langue } from "./config"
import type { Dictionnaire } from "./fr"

// Accès à la langue depuis un COMPOSANT SERVEUR.
//
// Les composants clients passent par useLang(). Ceux qui s'exécutent sur le
// serveur — le layout, la page galerie — n'ont pas de hook : ils lisent le
// cookie directement.
//
// Ce fichier est volontairement séparé de config.ts : il importe
// next/headers, qui n'existe pas côté navigateur. L'importer depuis un
// composant client provoquerait une erreur de compilation.

const DICTIONNAIRES: Record<Langue, Dictionnaire> = { fr, en }

export async function getLangue(): Promise<Langue> {
  const choix = (await cookies()).get(COOKIE_LANGUE)?.value
  return estLangueValide(choix) ? choix : LANGUE_DEFAUT
}

export async function getDictionnaire(): Promise<Dictionnaire> {
  return DICTIONNAIRES[await getLangue()]
}
