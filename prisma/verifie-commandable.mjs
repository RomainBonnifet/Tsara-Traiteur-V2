// Chaque formule publique est-elle réellement commandable ?
//
// Rejoue les contrôles de lib/panier.ts sur le catalogue réel, et signale ce
// qui ferait échouer une commande. Un défaut de configuration ne se voit pas
// depuis le dashboard : la page de commande s'affiche normalement, et le
// refus n'arrive qu'au moment du paiement.
//
// LECTURE SEULE.
//
//   node --env-file=.env.production prisma/verifie-commandable.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

console.log("Base :", new URL(process.env.DATABASE_URL).host)
console.log()

const categories = await prisma.categorie.findMany({
  where: { visiblePublic: true },
  orderBy: { id: "asc" },
  include: {
    formules: {
      orderBy: { position: "asc" },
      include: {
        slots: {
          orderBy: { position: "asc" },
          include: {
            // Même filtre que lib/panier.ts : seuls les articles DISPONIBLES
            // comptent. Un créneau dont tout le stock est épuisé est vide.
            articles: { where: { article: { disponible: true } }, select: { articleId: true } },
          },
        },
      },
    },
  },
})

let bloquantes = 0
let avertissements = 0

for (const categorie of categories) {
  if (categorie.formules.length === 0) continue
  console.log(`── ${categorie.nom} ──`)

  for (const f of categorie.formules) {
    const vides = f.slots.filter((s) => s.articles.length === 0)
    const servis = f.slots.filter((s) => s.articles.length > 0)

    // Plus aucun créneau servi : le client ne choisit rien et ne reçoit rien.
    // La commande « passe » mais ne contient que le prix.
    if (servis.length === 0) {
      console.log(`  ✗ ${f.nom} — BLOQUANTE : aucun créneau ne contient d'article disponible.`)
      bloquantes++
      continue
    }

    if (vides.length > 0) {
      console.log(`  ! ${f.nom} — commandable, mais ${vides.length} créneau(x) ignoré(s) :`)
      for (const s of vides) console.log(`       « ${s.nom} » n'a aucun article disponible`)
      avertissements++
      continue
    }

    console.log(`  ✓ ${f.nom} — ${servis.length} créneau(x), tous servis`)
  }
  console.log()
}

if (bloquantes > 0) {
  console.log(`${bloquantes} formule(s) impossibles à honorer : rattachez des articles ou retirez-les de la vente.`)
} else if (avertissements > 0) {
  console.log(
    `Aucune formule bloquée.\n` +
    `Les créneaux signalés restent affichés sur les cartes mais ne sont ni\n` +
    `choisis ni livrés : vérifiez que c'est bien l'intention.`
  )
} else {
  console.log("Toutes les formules publiques sont complètes et commandables.")
}

await prisma.$disconnect()
process.exit(bloquantes > 0 ? 1 : 0)
