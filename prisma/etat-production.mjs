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

const categories = await q(`SELECT "id","nom","creneaux" FROM "Categorie" ORDER BY "id"`)

for (const c of categories) {
  const formules = await q(`
    SELECT "id","nom","prix","description","position","minPersonnes","pasPersonnes","unite","miseEnAvant"
    FROM "Formule" WHERE "categorieId" = ${c.id} ORDER BY "position","id"`)

  // La règle de /api/formules depuis la refonte : une catégorie sans formule
  // n'est pas servie au site public. Avec des formules, elle l'est — y
  // compris « Groupe », que l'ancien code excluait par son nom.
  const publique = formules.length > 0
  console.log(`── #${c.id} ${c.nom} ${publique ? "[VISIBLE sur le site public]" : "[masquée : aucune formule]"}`)
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
