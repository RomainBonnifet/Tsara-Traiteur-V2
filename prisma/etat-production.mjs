// Inventaire du catalogue d'une base.
//
// Sert à comparer la production à la base de travail avant un déploiement :
// le traiteur modifie son catalogue en ligne, la copie locale se périme.
//
// LECTURE SEULE. N'écrit rien, ne corrige rien.
//
//   node --env-file=.env.production prisma/etat-production.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const q = (sql) => prisma.$queryRawUnsafe(sql)

console.log("Base :", new URL(process.env.DATABASE_URL).host)
console.log()

// La colonne visiblePublic peut ne pas exister encore : ce script doit
// pouvoir tourner sur une base dont les migrations sont en retard, c est
// precisement le cas qu on cherche a diagnostiquer.
const colonneVisible = await q(`
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'Categorie' AND column_name = 'visiblePublic'`)
const aVisible = colonneVisible.length > 0
console.log(aVisible
  ? "Migration categorie_visible : APPLIQUEE"
  : "Migration categorie_visible : PAS ENCORE APPLIQUEE (toute categorie non vide est publique)")
console.log()

const categories = await q(
  `SELECT "id","nom","creneaux"${aVisible ? `,"visiblePublic"` : ""} FROM "Categorie" ORDER BY "id"`)

for (const c of categories) {
  const formules = await q(`
    SELECT "id","nom","prix","description","position","minPersonnes","pasPersonnes","unite","miseEnAvant"
    FROM "Formule" WHERE "categorieId" = ${c.id} ORDER BY "position","id"`)

  // Regle de /api/formules : visiblePublic ET au moins une formule.
  const publique = (aVisible ? c.visiblePublic : true) && formules.length > 0
  const raison = publique
    ? "[VISIBLE sur le site public]"
    : formules.length === 0 ? "[masquée : aucune formule]" : "[MASQUÉE : visiblePublic = false]"
  console.log(`── #${c.id} ${c.nom} ${raison}`)
  console.log(`   créneaux : ${c.creneaux?.length ? c.creneaux.join(" | ") : "(aucun)"}`)

  if (formules.length === 0) { console.log() ; continue }

  for (const f of formules) {
    const slots = await q(`
      SELECT s."nom", s."quantiteParUnite" AS q, s."capacite" AS c,
             (SELECT COUNT(*)::int FROM "SlotArticle" sa WHERE sa."slotId" = s."id") AS nb
      FROM "Slot" s WHERE s."formuleId" = ${f.id} ORDER BY s."position","id"`)
    console.log(`   ${String(f.nom).padEnd(14)} ${String(f.prix).padStart(7)} € / ${f.unite}   min=${f.minPersonnes} pas=${f.pasPersonnes}${f.miseEnAvant ? "  [mise en avant]" : ""}`)
    if (f.description) console.log(`       « ${f.description} »`)
    for (const s of slots) {
      const qte = s.q > 1 ? `${s.q}× ` : ""
      const part = s.c > 1 ? ` (1 pour ${s.c})` : ""
      console.log(`       - ${qte}${s.nom}${part}  [${s.nb} article(s)]`)
    }
  }
  console.log()
}

const nbCommandes = await q(`SELECT COUNT(*)::int AS n FROM "Order"`)
console.log(`Commandes enregistrées : ${nbCommandes[0].n}`)

await prisma.$disconnect()
