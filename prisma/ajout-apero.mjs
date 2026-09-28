// Ajout de l'offre « Plateaux Apéro » : la catégorie, ses 5 produits et ses
// 3 formules (Petite / Moyenne / Grande).
//
//   node --env-file=.env prisma/ajout-apero.mjs
//
// Écrit en JS plutôt qu'en TS pour éviter ts-node et ses guillemets
// imbuvables sous Windows : c'est un script de données, pas du code d'appli.
//
// IDEMPOTENT : chaque élément est cherché avant d'être créé. Relancer le
// script ne crée aucun doublon — ce qui permet de l'utiliser tel quel sur la
// base de production le jour du déploiement.
//
// ATTENTION : les prix sont des VALEURS DE DÉPART À AJUSTER par le traiteur
// dans le dashboard. Je n'ai pas ses tarifs réels.

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const CATEGORIE = "Apéro"

// Ces 5 produits composent chaque plateau, sans choix du client :
// un créneau par produit, avec un seul article dedans.
const PRODUITS = [
  "Saucisson nature",
  "Terrine de campagne",
  "Chips artisanales",
  "Tartinable",
  "Pain tranché",
]

const PLATEAUX = [
  { nom: "Petite", prix: 25, description: "Pour 2 à 3 personnes", position: 0 },
  { nom: "Moyenne", prix: 40, description: "Pour 4 à 6 personnes", position: 1 },
  { nom: "Grande", prix: 60, description: "Pour 8 à 10 personnes", position: 2 },
]

// Article.nom et Formule.nom ne sont pas uniques en base : on ne peut pas
// utiliser upsert, il faut chercher puis créer si absent.
async function trouverOuCreerArticle(nom) {
  const existant = await prisma.article.findFirst({ where: { nom } })
  if (existant) return { article: existant, cree: false }
  return { article: await prisma.article.create({ data: { nom } }), cree: true }
}

async function main() {
  // Categorie.nom est @unique : upsert fonctionne ici.
  const categorie = await prisma.categorie.upsert({
    where: { nom: CATEGORIE },
    update: {},
    create: { nom: CATEGORIE },
  })
  console.log(`Catégorie « ${categorie.nom} » : #${categorie.id}`)

  const articles = []
  for (const nom of PRODUITS) {
    const { article, cree } = await trouverOuCreerArticle(nom)
    articles.push(article)
    console.log(`  article ${cree ? "créé  " : "existe"} #${article.id} ${article.nom}`)
  }

  for (const p of PLATEAUX) {
    let formule = await prisma.formule.findFirst({
      where: { nom: p.nom, categorieId: categorie.id },
    })

    if (!formule) {
      formule = await prisma.formule.create({
        data: {
          nom: p.nom,
          prix: p.prix,
          description: p.description,
          position: p.position,
          categorieId: categorie.id,
          // Une formule apéro se vend à la pièce, pas au couvert.
          unite: "formule",
          minPersonnes: 1,
          pasPersonnes: 1,
        },
      })
      console.log(`  formule créée  #${formule.id} ${formule.nom} — ${p.prix} € / formule`)
    } else {
      console.log(`  formule existe #${formule.id} ${formule.nom} (prix et description laissés tels quels)`)
    }

    // Un créneau par produit, contenant ce seul produit : la page de
    // commande les affichera comme « inclus » au lieu de demander un choix.
    for (const [i, article] of articles.entries()) {
      let slot = await prisma.slot.findFirst({
        where: { nom: article.nom, formuleId: formule.id },
      })
      if (!slot) {
        slot = await prisma.slot.create({
          data: { nom: article.nom, formuleId: formule.id, capacite: 1, position: i },
        })
      }
      await prisma.slotArticle.upsert({
        where: { slotId_articleId: { slotId: slot.id, articleId: article.id } },
        update: {},
        create: { slotId: slot.id, articleId: article.id },
      })
    }
    console.log(`    ${articles.length} créneaux rattachés`)
  }

  console.log("\nTerminé. Ajustez les prix dans le dashboard : Formules → Éditer.")
}

main()
  .catch((e) => {
    console.error("ERREUR :", e.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
