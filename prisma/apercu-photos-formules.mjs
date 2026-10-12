// Photos d'aperçu sur les cartes de formule.
//
// Sert UNIQUEMENT à voir le rendu avant que le traiteur n'ajoute les
// siennes depuis son dashboard. Les images viennent de public/img/Photos,
// déjà dans le dépôt : ce sont des chemins locaux, pas des URL Cloudinary.
//
// SANS DANGER : ne remplit que les formules dont la photo est vide. Une
// photo posée par le traiteur ne sera jamais écrasée, même si ce script est
// lancé par erreur sur la production.
//
// Pour tout effacer :
//   node --env-file=.env prisma/apercu-photos-formules.mjs --vider
//
// Ou, formule par formule : Dashboard → Formules → Éditer → Retirer.

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const APERCUS = {
  "Douceur": "/img/Photos/viennoiserie.jpg",
  "Signature": "/img/Photos/potyahourt.png",
  "Découverte": "/img/Photos/plancheAfterWork.jpeg",
  "Conviviale": "/img/Photos/charcut.jpg",
  "Festive": "/img/Photos/plateau-fruit.jpg",
}

const vider = process.argv.includes("--vider")

if (vider) {
  // On n'efface que les chemins locaux : une URL Cloudinary vient forcément
  // d'un téléversement du traiteur, elle n'est pas de notre fait.
  const { count } = await prisma.formule.updateMany({
    where: { image: { startsWith: "/img/" } },
    data: { image: null },
  })
  console.log(`${count} photo(s) d'aperçu retirée(s). Celles du dashboard sont intactes.`)
  await prisma.$disconnect()
  process.exit(0)
}

for (const [nom, image] of Object.entries(APERCUS)) {
  const formule = await prisma.formule.findFirst({ where: { nom } })

  if (!formule) {
    console.log(`  « ${nom} » introuvable — ignorée`)
    continue
  }
  if (formule.image) {
    console.log(`  « ${nom} » a déjà une photo — laissée telle quelle`)
    continue
  }

  await prisma.formule.update({ where: { id: formule.id }, data: { image } })
  console.log(`  « ${nom} » -> ${image}`)
}

console.log("\nAperçu posé. Rechargez la page d'accueil.")
console.log("Pour l'effacer : node --env-file=.env prisma/apercu-photos-formules.mjs --vider")

await prisma.$disconnect()
