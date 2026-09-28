// Vérifie que le glossaire de contenu couvre tout ce qui est en base.
//
// Le glossaire (lib/i18n/contenu.ts) est une source de vérité PARALLÈLE à la
// base : rien ne garantit qu'ils restent synchronisés. Renommer « Boissons
// chaudes » en « Boissons » depuis le dashboard fait silencieusement
// réapparaître le français sur le site anglais.
//
// Ce script rend ce décalage VISIBLE. À lancer après chaque modification du
// catalogue, et avant chaque déploiement.
//
// Il ne corrige rien et n'écrit rien : il liste, et c'est tout.
//
// Lancer avec :  node --env-file=.env prisma/verifie-traductions.mjs

import { readFileSync } from "node:fs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// On lit le glossaire comme du TEXTE plutôt que de l'importer : contenu.ts
// est du TypeScript, que Node ne sait pas exécuter directement. Les clés sont
// les chaînes en début de ligne, avant le « : ».
const source = readFileSync(new URL("../lib/i18n/contenu.ts", import.meta.url), "utf8")
const cles = new Set(
  [...source.matchAll(/^\s{2}"((?:[^"\\]|\\.)*)":\s*"/gm)].map((m) => m[1])
)

const normaliser = (t) => t.replace(/\s+/g, " ").trim().toLowerCase()
const clesNormalisees = new Set([...cles].map(normaliser))

const q = (sql) => prisma.$queryRawUnsafe(sql)

// Chaque entrée : d'où vient la chaîne, et la liste des chaînes.
const sources = [
  // Formule.nom volontairement absent : les noms de formules sont des noms
  // commerciaux et restent en francais dans toutes les langues.
  ["Formule.description", (await q(`SELECT "description" FROM "Formule" WHERE "description" IS NOT NULL`)).map((r) => r.description)],
  ["Slot.nom", (await q(`SELECT DISTINCT "nom" FROM "Slot"`)).map((r) => r.nom)],
  ["Article.nom", (await q(`SELECT "nom" FROM "Article" WHERE "disponible"`)).map((r) => r.nom)],
  ["Article.description", (await q(`SELECT "description" FROM "Article" WHERE "disponible" AND "description" IS NOT NULL`)).map((r) => r.description)],
  ["Extra.nom", (await q(`SELECT "nom" FROM "Extra" WHERE "disponible"`)).map((r) => r.nom)],
  ["Extra.description", (await q(`SELECT "description" FROM "Extra" WHERE "disponible" AND "description" IS NOT NULL`)).map((r) => r.description)],
  ["Categorie.creneaux", (await q(`SELECT "creneaux" FROM "Categorie"`)).flatMap((r) => r.creneaux)],
]

let manquantes = 0
const vues = new Set()

for (const [origine, chaines] of sources) {
  const absentes = [...new Set(chaines)].filter((c) => c && !clesNormalisees.has(normaliser(c)))
  if (absentes.length === 0) continue

  console.log(`\n  ── ${origine} ──`)
  for (const c of absentes.sort()) {
    console.log(`     "${c}": "",`)
    manquantes++
  }
}

for (const [, chaines] of sources) for (const c of chaines) if (c) vues.add(normaliser(c))

// L'inverse compte aussi : une clé qui ne correspond plus à rien en base
// signale presque toujours un renommage côté dashboard. Ce n'est pas une
// erreur (on peut garder d'anciennes entrées), mais c'est bon à savoir.
const orphelines = [...cles].filter((c) => !vues.has(normaliser(c)))

if (manquantes === 0) {
  console.log("  Tout le contenu de la base est traduit.")
} else {
  console.log(`\n=> ${manquantes} chaîne(s) sans traduction anglaise.`)
  console.log("   Copiez les lignes ci-dessus dans lib/i18n/contenu.ts et remplissez-les.")
}

if (orphelines.length > 0) {
  console.log(`\n  Entrées du glossaire qui ne correspondent à rien en base (${orphelines.length}) :`)
  for (const c of orphelines.sort()) console.log(`     "${c}"`)
  console.log("   Souvent le signe d'un renommage depuis le dashboard.")
}

await prisma.$disconnect()

// Code de sortie 1 s'il manque quelque chose : utilisable dans un script de
// déploiement pour bloquer une mise en ligne partiellement traduite.
process.exit(manquantes > 0 ? 1 : 0)
