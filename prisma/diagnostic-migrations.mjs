// Diagnostic de l'état des migrations sur une base.
//
// À lancer quand `prisma migrate deploy` renvoie P3009 (« failed migrations
// in the target database »). Prisma refuse alors d'appliquer quoi que ce soit
// tant qu'une migration reste marquée en échec, même si les suivantes
// n'ont rien à voir.
//
// Ce script LIT seulement. Il n'écrit rien, ne répare rien : il dit ce qu'il
// faut réparer, et comment.
//
// Lancer avec l'URL de PRODUCTION :
//   $env:DATABASE_URL = "postgresql://..."
//   node prisma/diagnostic-migrations.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

console.log("Base interrogée :", new URL(process.env.DATABASE_URL).host)
console.log()

// ── 1. Les migrations en échec ──
const echouees = await prisma.$queryRawUnsafe(`
  SELECT "migration_name", "started_at", "finished_at", "rolled_back_at", "logs"
  FROM "_prisma_migrations"
  WHERE "finished_at" IS NULL OR "rolled_back_at" IS NOT NULL
  ORDER BY "started_at"
`)

if (echouees.length === 0) {
  console.log("Aucune migration en échec.")
} else {
  console.log("── Migrations en échec ──")
  for (const m of echouees) {
    console.log(`\n  ${m.migration_name}`)
    console.log(`    démarrée : ${m.started_at}`)
    console.log(`    terminée : ${m.finished_at ?? "JAMAIS (échec)"}`)
    // C'est cette ligne qui compte : elle contient l'erreur PostgreSQL.
    console.log(`    erreur   : ${m.logs ? String(m.logs).split("\n")[0] : "(aucun journal)"}`)
  }
}

// ── 2. Les colonnes que add_position devait créer existent-elles déjà ? ──
console.log("\n── Colonnes « position » ──")
const colonnes = await prisma.$queryRawUnsafe(`
  SELECT "table_name", "column_name"
  FROM information_schema.columns
  WHERE "table_schema" = 'public'
    AND "column_name" = 'position'
    AND "table_name" IN ('Formule', 'Slot')
`)
const a = (t) => colonnes.some((c) => c.table_name === t)
console.log(`  Formule.position : ${a("Formule") ? "EXISTE DÉJÀ" : "absente"}`)
console.log(`  Slot.position    : ${a("Slot") ? "EXISTE DÉJÀ" : "absente"}`)

// ── 3. Le verdict ──
console.log("\n── Que faire ──")
const cible = echouees.find((m) => m.migration_name === "20260413120000_add_position")
if (!cible) {
  console.log("  add_position n'est pas en échec : la cause est ailleurs.")
} else if (a("Formule") && a("Slot")) {
  console.log("  Les deux colonnes existent DÉJÀ : la migration a échoué parce")
  console.log("  qu'elle tentait de les recréer. La base est donc correcte, seul")
  console.log("  l'historique est faux. On marque la migration comme appliquée,")
  console.log("  SANS l'exécuter :")
  console.log("\n    npx prisma migrate resolve --applied 20260413120000_add_position\n")
} else {
  console.log("  Les colonnes MANQUENT : la migration a échoué avant de les créer.")
  console.log("  Il faut la faire rejouer, pas la déclarer appliquée :")
  console.log("\n    npx prisma migrate resolve --rolled-back 20260413120000_add_position\n")
  console.log("  Le prochain déploiement la relancera.")
}

// ── 4. Combien de migrations attendent derrière ? ──
const appliquees = await prisma.$queryRawUnsafe(
  `SELECT COUNT(*)::int AS n FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL`
)
console.log(`  Migrations réellement appliquées en base : ${appliquees[0].n} sur 13.`)

await prisma.$disconnect()
