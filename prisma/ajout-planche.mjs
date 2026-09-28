// Ajout de la planche aux plateaux apéro Conviviale et Festive.
//
// Modélisation : la TAILLE vit dans le nom du créneau, pas dans l'article.
// Un Slot appartient à une seule formule, donc « format classique » et
// « format généreux » sont naturellement exclusifs — le client ne choisit
// pas sa taille, elle découle du plateau qu'il a pris. Les trois garnitures
// (charcuterie, fromage, mixte) sont en revanche les MÊMES articles,
// rattachés aux deux créneaux via la table de liaison SlotArticle.
//
// Le script est IDEMPOTENT : chaque étape vérifie l'existant avant de créer.
// On peut donc le rejouer sans dupliquer quoi que ce soit, ici comme en
// production.
//
// Lancer avec :  node --env-file=.env prisma/ajout-planche.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Les trois garnitures proposées au choix, communes aux deux formules.
const GARNITURES = [
  { nom: "Charcuterie", description: "Sélection de charcuteries de nos producteurs" },
  { nom: "Fromage", description: "Sélection de fromages affinés" },
  // Nom volontairement court : il apparaît dans la liste « au choix » des
  // cartes d'accueil, où « Mixte charcuterie & fromage » déborderait.
  // Le détail vit dans la description, affichée sous le nom à la commande.
  { nom: "Mixte", description: "Moitié charcuterie, moitié fromage" },
]

// Nom du créneau par formule. C'est lui qui porte la taille.
const CRENEAUX = {
  "Conviviale": "Planche format classique",
  "Festive": "Planche format généreux",
}

const journal = []

// ── 1. Les trois articles ──
const articles = []
for (const g of GARNITURES) {
  // findFirst et non upsert : "nom" n'est pas unique sur Article, un upsert
  // exigerait une contrainte unique que le schéma ne déclare pas.
  let article = await prisma.article.findFirst({ where: { nom: g.nom } })
  if (article) {
    journal.push(`article « ${g.nom} » déjà présent (#${article.id})`)
  } else {
    article = await prisma.article.create({
      data: { nom: g.nom, description: g.description, disponible: true },
    })
    journal.push(`article « ${g.nom} » créé (#${article.id})`)
  }
  articles.push(article)
}

// ── 2. Un créneau par formule ──
const categorie = await prisma.categorie.findUnique({ where: { nom: "Apéro" } })
if (!categorie) {
  console.error("Catégorie « Apéro » introuvable. Rien n'a été fait.")
  process.exit(1)
}

for (const [nomFormule, nomCreneau] of Object.entries(CRENEAUX)) {
  const formule = await prisma.formule.findFirst({
    where: { nom: nomFormule, categorieId: categorie.id },
    include: { slots: true },
  })
  if (!formule) {
    journal.push(`formule « ${nomFormule} » introuvable — ignorée`)
    continue
  }

  let slot = formule.slots.find((s) => s.nom === nomCreneau)

  if (slot) {
    journal.push(`créneau « ${nomCreneau} » déjà présent (#${slot.id})`)
  } else {
    // La planche est la pièce maîtresse du plateau : elle se place en tête
    // de liste, pas après le pain. On décale donc les créneaux existants
    // d'un cran plutôt que d'ajouter à la fin.
    await prisma.slot.updateMany({
      where: { formuleId: formule.id },
      data: { position: { increment: 1 } },
    })
    slot = await prisma.slot.create({
      data: {
        nom: nomCreneau,
        formuleId: formule.id,
        position: 0,
        // 1 planche par plateau, non partagée : les deux réglages restent
        // à leur valeur par défaut, la taille étant déjà dans le nom.
        capacite: 1,
        quantiteParUnite: 1,
      },
    })
    journal.push(`créneau « ${nomCreneau} » créé (#${slot.id}), placé en tête`)
  }

  // ── 3. Rattacher les trois garnitures ──
  for (const article of articles) {
    // La clé primaire composite (slotId, articleId) rend l'opération
    // naturellement idempotente : createMany + skipDuplicates ne crée que
    // ce qui manque, sans lever d'erreur sur ce qui existe déjà.
    const { count } = await prisma.slotArticle.createMany({
      data: [{ slotId: slot.id, articleId: article.id }],
      skipDuplicates: true,
    })
    if (count > 0) journal.push(`  « ${article.nom} » rattaché à « ${nomCreneau} »`)
  }
}

for (const ligne of journal) console.log("  " + ligne)

// ── Contrôle final ──
console.log("\nÉtat des plateaux apéro :")
const formules = await prisma.formule.findMany({
  where: { categorieId: categorie.id },
  orderBy: { position: "asc" },
  include: {
    slots: {
      orderBy: { position: "asc" },
      include: { articles: { include: { article: true } } },
    },
  },
})
for (const f of formules) {
  console.log(`\n  ── ${f.nom} ──`)
  for (const s of f.slots) {
    const qte = s.quantiteParUnite > 1 ? `${s.quantiteParUnite}× ` : ""
    const choix = s.articles.length > 1
      ? `  (au choix : ${s.articles.map((a) => a.article.nom).join(", ")})`
      : ""
    console.log(`     ${qte}${s.nom}${choix}`)
  }
}

await prisma.$disconnect()
