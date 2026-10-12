import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { getDictionnaire, getLangue } from "@/lib/i18n/serveur"
import { traduireContenu } from "@/lib/i18n/contenu"

// Aperçu de la galerie sur la page d'accueil.
//
// Les photos viennent de la base, pas d'une liste écrite ici : c'est le
// traiteur qui les gère depuis son dashboard, et l'aperçu doit refléter ce
// qu'il publie sans intervention du développeur.
//
// COMPOSANT SERVEUR, et c'est ce qui rend la chose simple : il interroge
// Prisma directement. En composant client il aurait fallu une route API
// publique, un état de chargement et un appel réseau de plus — pour des
// images qui ne changent jamais pendant la visite.
//
// Pas de hook useLang() ici, donc : la langue se lit côté serveur.

// La grille attend exactement cinq éléments : une grande image sur deux
// rangées, puis quatre petites (voir .galerie-grid dans globals.css).
// Au-delà, les suivantes déborderaient hors de la maquette.
const NB_APERCU = 5

export default async function Galerie() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: NB_APERCU,
  })

  // Aucune photo : on n'affiche pas la section du tout. Un titre « La
  // galerie » suivi d'une grille vide donnerait l'impression d'un site
  // cassé, alors que c'est simplement un catalogue pas encore rempli.
  if (photos.length === 0) return null

  const t = await getDictionnaire()
  const langue = await getLangue()

  return (
    <section className="galerie reveal" id="galerie">
      <div className="galerie-header">
        <div>
          <div className="section-label">{t.galerie.label}</div>
          <h2>{t.galerie.titre} <em>{t.galerie.titreEm}</em></h2>
        </div>
        <a href="/galerie" className="galerie-link">{t.galerie.lien}</a>
      </div>
      <div className="galerie-grid">
        {photos.map((photo) => (
          <div className="galerie-item" key={photo.id}>
            <Image
              src={photo.url}
              // La légende est saisie au dashboard : elle passe par le
              // glossaire, comme les noms de produits. Vide, elle retombe
              // sur un texte générique — un alt absent est pire qu'un alt
              // imprécis pour un lecteur d'écran.
              alt={traduireContenu(photo.alt, langue) || t.galeriePage.photoParDefaut}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
