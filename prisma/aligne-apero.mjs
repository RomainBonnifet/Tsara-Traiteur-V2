// Aligne les formules apéro sur leur nommage et leur tarif définitifs.
//
// Pourquoi ce script existe : ajout-apero.mjs crée les trois formules avec
// des noms et des prix PROVISOIRES (Petite / Moyenne / Grande à 25/40/60 €),
// que le traiteur est censé ajuster depuis le dashboard. Ça a été fait sur la
// base de travail, mais la production a reçu le script tel quel — elle
// afficherait donc des tarifs bouchons.
//
// Les scripts qui suivent (quantites-apero, ajout-planche) cherchent les
// formules par leur nom DÉFINITIF : sans cet alignement, ils ne trouvent rien
// et ne font rien, silencieusement.
//
// IDEMPOTENT : une formule déjà renommée n'est plus trouvée sous son ancien
// nom, le script la signale et passe.
//
//   node --env-file=.env.production prisma/aligne-apero.mjs

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ancien nom -> valeurs définitives.
// Ce sont celles réglées depuis le dashboard sur la base de travail : elles
// font foi, c'est là que la décision commerciale a été prise.
const ALIGNEMENTS = [
  { ancien: "Petite",  nom: "Découverte", prix: 34.9,  description: "Pour 2 à 4 personnes",   minPersonnes: 2, position: 0 },
  { ancien: "Moyenne", nom: "Conviviale", prix: 99.9,  description: "Pour 6 à 8 personnes",   minPersonnes: 1, position: 1 },
  { ancien: "Grande",  nom: "Festive",    prix: 149.9, description: "Pour 10 à 12 personnes", minPersonnes: 1, position: 2 },
]

const categorie = await prisma.categorie.findUnique({ where: { nom: "Apéro" } })
if (!categorie) {
  console.error("Catégorie « Apéro » introuvable. Rien n'a été fait.")
  process.exit(1)
}

for (const a of ALIGNEMENTS) {
  const formule = await prisma.formule.findFirst({
    where: { nom: a.ancien, categorieId: categorie.id },
  })

  if (!formule) {
    // Soit déjà renommée, soit jamais créée : on vérifie laquelle des deux.
    const deja = await prisma.formule.findFirst({
      where: { nom: a.nom, categorieId: categorie.id },
    })
    console.log(
      deja
        ? `  « ${a.nom} » déjà en place (#${deja.id}) — ${deja.prix} €`
        : `  ni « ${a.ancien} » ni « ${a.nom} » trouvées — ignorées`
    )
    continue
  }

  await prisma.formule.update({
    where: { id: formule.id },
    data: {
      nom: a.nom,
      prix: a.prix,
      description: a.description,
      minPersonnes: a.minPersonnes,
      position: a.position,
    },
  })
  console.log(`  « ${a.ancien} » -> « ${a.nom} »  ${formule.prix} € -> ${a.prix} €`)
}

console.log("\nÉtat des formules apéro :")
for (const f of await prisma.formule.findMany({
  where: { categorieId: categorie.id },
  orderBy: { position: "asc" },
})) {
  console.log(`  ${String(f.nom).padEnd(12)} ${String(f.prix).padStart(7)} €   « ${f.description ?? ""} »`)
}

console.log("\nRelancez ensuite quantites-apero.mjs puis ajout-planche.mjs :")
console.log("ils cherchent les formules par leur nom définitif.")

await prisma.$disconnect()
