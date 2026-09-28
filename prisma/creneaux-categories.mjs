// Créneaux de livraison par catégorie.
//
// Un petit-déjeuner se livre le matin, un plateau apéro en soirée. Ces
// horaires sont une donnée commerciale : ils vivent en base plutôt que dans
// le code, pour que le traiteur puisse les faire évoluer sans déploiement.
//
// IDEMPOTENT : réécrit les mêmes valeurs, ignore les catégories absentes.
//
// SQL brut plutôt que prisma.categorie.update() : sous Windows, le client
// Prisma ne peut pas être régénéré tant que `npm run dev` tourne, et il
// ignore donc encore la colonne "creneaux". $executeRawUnsafe envoie la
// requête telle quelle au serveur. Le nom "Unsafe" désigne le fait que la
// CHAÎNE de requête est dynamique ; ici elle est constante, et les valeurs
// passent bien par des paramètres ($1, $2), donc aucune injection possible.
//
// Lancer avec :  node --env-file=.env prisma/creneaux-categories.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const CRENEAUX = {
  "Petit-déjeuner": ["7h30 – 8h30", "8h30 – 9h30", "9h30 – 10h30", "10h30 – 11h30"],
  "Apéro": ["Entre 18h et 20h", "Après 20h"],
}

for (const [nom, creneaux] of Object.entries(CRENEAUX)) {
  const touchees = await prisma.$executeRawUnsafe(
    `UPDATE "Categorie" SET "creneaux" = $1::text[] WHERE "nom" = $2`,
    creneaux,
    nom
  )
  console.log(
    touchees === 0
      ? `  catégorie « ${nom} » introuvable — ignorée`
      : `  ${nom.padEnd(16)} -> ${creneaux.join(" | ")}`
  )
}

console.log("\nÉtat final :")
const lignes = await prisma.$queryRawUnsafe(
  `SELECT "id", "nom", "creneaux" FROM "Categorie" ORDER BY "id"`
)
for (const c of lignes) {
  const liste = c.creneaux && c.creneaux.length > 0
    ? c.creneaux.join(" | ")
    : "(aucun — repli sur les créneaux par défaut)"
  console.log(`  #${c.id} ${String(c.nom).padEnd(16)} ${liste}`)
}

await prisma.$disconnect()
