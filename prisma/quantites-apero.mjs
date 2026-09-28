// Quantités des plateaux apéro.
//
// Découverte = 1 exemplaire de chaque produit, Conviviale = 2, Festive = 3.
// Le pain tranché est exclu : il accompagne le plateau, on ne le compte pas
// devant le client (l'afficher « 3× Pain tranché » n'aurait aucun sens
// commercial).
//
// Le script est IDEMPOTENT : le relancer ne fait que réécrire les mêmes
// valeurs. C'est ce qui permet de le rejouer en production sans réfléchir.
//
// Il utilise du SQL brut plutôt que prisma.slot.update(). Raison : le client
// Prisma généré sur cette machine ignore encore la colonne quantiteParUnite
// (le renommage du moteur échoue tant que `npm run dev` tourne, sous
// Windows). $executeRaw envoie la requête telle quelle au serveur, sans
// passer par le schéma embarqué. Contrepartie à connaître : on perd la
// vérification de types de Prisma, c'est PostgreSQL qui arbitre.
//
// Lancer avec :  node --env-file=.env prisma/quantites-apero.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Quantité par plateau, selon le nom de la formule.
const QUANTITES = {
  "decouverte": 1,
  "conviviale": 2,
  "festive": 3,
}

// Produits d'accompagnement : toujours 1, jamais de quantité affichée.
const SANS_QUANTITE = ["pain tranche"]

// Normalisation : minuscules et accents retirés. Sans ça, « Pain tranché »
// saisi sans accent dans le dashboard échapperait à l'exclusion.
// NFD décompose « é » en « e » + accent, puis on supprime les accents.
const normaliser = (texte) =>
  texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

const slots = await prisma.$queryRaw`
  SELECT s."id", s."nom" AS creneau, f."nom" AS formule
  FROM "Slot" s
  JOIN "Formule" f ON f."id" = s."formuleId"
  JOIN "Categorie" c ON c."id" = f."categorieId"
  WHERE c."nom" = 'Apéro'
  ORDER BY f."position", s."position"
`

if (slots.length === 0) {
  console.error("Aucun créneau trouvé dans la catégorie « Apéro ». Rien à faire.")
  process.exit(1)
}

const inconnues = new Set()
let modifies = 0

for (const slot of slots) {
  const cle = normaliser(slot.formule)
  if (!(cle in QUANTITES)) {
    inconnues.add(slot.formule)
    continue
  }

  const quantite = SANS_QUANTITE.includes(normaliser(slot.creneau))
    ? 1
    : QUANTITES[cle]

  await prisma.$executeRaw`
    UPDATE "Slot" SET "quantiteParUnite" = ${quantite} WHERE "id" = ${slot.id}
  `
  console.log(`  ${slot.formule.padEnd(12)} | ${slot.creneau.padEnd(22)} -> ${quantite}`)
  modifies++
}

if (inconnues.size > 0) {
  console.log(
    `\nFormules laissées intactes (absentes de QUANTITES) : ${[...inconnues].join(", ")}`
  )
}
console.log(`\n${modifies} créneau(x) mis à jour.`)

await prisma.$disconnect()
