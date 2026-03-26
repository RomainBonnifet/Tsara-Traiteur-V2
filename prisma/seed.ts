import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ========== CATÉGORIES ==========
  const individuel = await prisma.categorie.create({
    data: { nom: "Individuel" },
  });
  const groupe = await prisma.categorie.create({ data: { nom: "Groupe" } });

  // ========== ARTICLES ==========
  const cafe = await prisma.article.create({ data: { nom: "Café" } });
  const the = await prisma.article.create({ data: { nom: "Thé noir" } });
  const infusion = await prisma.article.create({ data: { nom: "Infusion" } });

  const croissant = await prisma.article.create({ data: { nom: "Croissant" } });
  const painChoco = await prisma.article.create({
    data: { nom: "Pain au chocolat" },
  });
  const chausson = await prisma.article.create({
    data: { nom: "Chausson aux pommes" },
  });

  const jusOrange = await prisma.article.create({
    data: { nom: "Jus d'orange" },
  });
  const jusPomme = await prisma.article.create({
    data: { nom: "Jus de pomme" },
  });
  const jusMangue = await prisma.article.create({
    data: { nom: "Jus de mangue" },
  });

  const yaourt = await prisma.article.create({
    data: { nom: "Yaourt fermier" },
  });
  const fromBlanc = await prisma.article.create({
    data: { nom: "Fromage blanc" },
  });

  const caneleNature = await prisma.article.create({
    data: { nom: "Mini canelé nature" },
  });
  const caneleChoco = await prisma.article.create({
    data: { nom: "Mini canelé chocolat" },
  });

  const plateauFromage = await prisma.article.create({
    data: { nom: "Plateau de fromages" },
  });
  const plateauCharcuterie = await prisma.article.create({
    data: { nom: "Plateau de charcuterie" },
  });
  const plateauMixte = await prisma.article.create({
    data: { nom: "Plateau mixte" },
  });
  const plateauFruits = await prisma.article.create({
    data: { nom: "Plateau de fruits frais" },
  });

  const painBeurre = await prisma.article.create({
    data: { nom: "Pain, beurre, confiture maison" },
  });

  const eauPlate = await prisma.article.create({ data: { nom: "Eau plate" } });
  const eauPetillante = await prisma.article.create({
    data: { nom: "Eau pétillante" },
  });

  // ========== FORMULE DOUCEUR ==========
  const douceur = await prisma.formule.create({
    data: { nom: "Douceur", prix: 9.9, categorieId: individuel.id },
  });
  const douceurBoisson = await prisma.slot.create({
    data: { nom: "Boisson chaude", formuleId: douceur.id },
  });
  const douceurViennoiserie = await prisma.slot.create({
    data: { nom: "Viennoiserie artisanale", formuleId: douceur.id },
  });
  const douceurPain = await prisma.slot.create({
    data: { nom: "Pain, beurre & confiture", formuleId: douceur.id },
  });
  const douceurJus = await prisma.slot.create({
    data: { nom: "Jus de fruits", formuleId: douceur.id },
  });

  await prisma.slotArticle.createMany({
    data: [
      { slotId: douceurBoisson.id, articleId: cafe.id },
      { slotId: douceurBoisson.id, articleId: the.id },
      { slotId: douceurBoisson.id, articleId: infusion.id },
      { slotId: douceurViennoiserie.id, articleId: croissant.id },
      { slotId: douceurViennoiserie.id, articleId: painChoco.id },
      { slotId: douceurViennoiserie.id, articleId: chausson.id },
      { slotId: douceurPain.id, articleId: painBeurre.id },
      { slotId: douceurJus.id, articleId: jusOrange.id },
      { slotId: douceurJus.id, articleId: jusPomme.id },
      { slotId: douceurJus.id, articleId: jusMangue.id },
    ],
  });

  // ========== FORMULE SIGNATURE ==========
  const signature = await prisma.formule.create({
    data: { nom: "Signature", prix: 15.5, categorieId: individuel.id },
  });
  const sigBoisson = await prisma.slot.create({
    data: { nom: "Boisson chaude", formuleId: signature.id },
  });
  const sigViennoiserie = await prisma.slot.create({
    data: { nom: "Viennoiserie artisanale", formuleId: signature.id },
  });
  const sigPain = await prisma.slot.create({
    data: { nom: "Pain, beurre, confiture", formuleId: signature.id },
  });
  const sigDessert = await prisma.slot.create({
    data: { nom: "Dessert fermier", formuleId: signature.id },
  });
  const sigCanele = await prisma.slot.create({
    data: { nom: "Mini canelé", formuleId: signature.id },
  });
  const sigJus = await prisma.slot.create({
    data: { nom: "Jus de fruits", formuleId: signature.id },
  });

  await prisma.slotArticle.createMany({
    data: [
      { slotId: sigBoisson.id, articleId: cafe.id },
      { slotId: sigBoisson.id, articleId: the.id },
      { slotId: sigBoisson.id, articleId: infusion.id },
      { slotId: sigViennoiserie.id, articleId: croissant.id },
      { slotId: sigViennoiserie.id, articleId: painChoco.id },
      { slotId: sigViennoiserie.id, articleId: chausson.id },
      { slotId: sigPain.id, articleId: painBeurre.id },
      { slotId: sigDessert.id, articleId: yaourt.id },
      { slotId: sigDessert.id, articleId: fromBlanc.id },
      { slotId: sigCanele.id, articleId: caneleNature.id },
      { slotId: sigCanele.id, articleId: caneleChoco.id },
      { slotId: sigJus.id, articleId: jusOrange.id },
      { slotId: sigJus.id, articleId: jusPomme.id },
      { slotId: sigJus.id, articleId: jusMangue.id },
    ],
  });

  // ========== FORMULE CONTINENTAL ==========
  const continental = await prisma.formule.create({
    data: { nom: "Continental", prix: 34.9, categorieId: individuel.id },
  });
  const contBoisson = await prisma.slot.create({
    data: { nom: "Boisson chaude", formuleId: continental.id },
  });
  const contViennoiserie = await prisma.slot.create({
    data: { nom: "Viennoiserie artisanale", formuleId: continental.id },
  });
  const contPain = await prisma.slot.create({
    data: { nom: "Pain, beurre, confiture", formuleId: continental.id },
  });
  const contDessert = await prisma.slot.create({
    data: { nom: "Dessert fermier", formuleId: continental.id },
  });
  const contCanele = await prisma.slot.create({
    data: { nom: "Mini canelé", formuleId: continental.id },
  });
  const contPlateau = await prisma.slot.create({
    data: { nom: "Plateau fromages & charcuteries", formuleId: continental.id },
  });
  const contFruits = await prisma.slot.create({
    data: { nom: "Plateau de fruits frais", formuleId: continental.id },
  });
  const contJus = await prisma.slot.create({
    data: { nom: "Jus de fruits", formuleId: continental.id },
  });

  await prisma.slotArticle.createMany({
    data: [
      { slotId: contBoisson.id, articleId: cafe.id },
      { slotId: contBoisson.id, articleId: the.id },
      { slotId: contBoisson.id, articleId: infusion.id },
      { slotId: contViennoiserie.id, articleId: croissant.id },
      { slotId: contViennoiserie.id, articleId: painChoco.id },
      { slotId: contViennoiserie.id, articleId: chausson.id },
      { slotId: contPain.id, articleId: painBeurre.id },
      { slotId: contDessert.id, articleId: yaourt.id },
      { slotId: contDessert.id, articleId: fromBlanc.id },
      { slotId: contCanele.id, articleId: caneleNature.id },
      { slotId: contCanele.id, articleId: caneleChoco.id },
      { slotId: contPlateau.id, articleId: plateauFromage.id },
      { slotId: contPlateau.id, articleId: plateauCharcuterie.id },
      { slotId: contPlateau.id, articleId: plateauMixte.id },
      { slotId: contFruits.id, articleId: plateauFruits.id },
      { slotId: contJus.id, articleId: jusOrange.id },
      { slotId: contJus.id, articleId: jusPomme.id },
      { slotId: contJus.id, articleId: jusMangue.id },
    ],
  });

  // ========== FORMULE ESSENTIEL (Groupe) ==========
  const essentiel = await prisma.formule.create({
    data: { nom: "Essentiel", prix: 9.9, categorieId: groupe.id },
  });
  const essBoisson = await prisma.slot.create({
    data: { nom: "Boissons chaudes", formuleId: essentiel.id },
  });
  const essViennoiserie = await prisma.slot.create({
    data: { nom: "Mini viennoiseries", formuleId: essentiel.id },
  });
  const essJus = await prisma.slot.create({
    data: { nom: "Jus de fruits", formuleId: essentiel.id },
  });
  const essEau = await prisma.slot.create({
    data: { nom: "Eau", formuleId: essentiel.id },
  });

  await prisma.slotArticle.createMany({
    data: [
      { slotId: essBoisson.id, articleId: cafe.id },
      { slotId: essBoisson.id, articleId: the.id },
      { slotId: essBoisson.id, articleId: infusion.id },
      { slotId: essViennoiserie.id, articleId: croissant.id },
      { slotId: essViennoiserie.id, articleId: painChoco.id },
      { slotId: essViennoiserie.id, articleId: chausson.id },
      { slotId: essJus.id, articleId: jusOrange.id },
      { slotId: essJus.id, articleId: jusPomme.id },
      { slotId: essJus.id, articleId: jusMangue.id },
      { slotId: essEau.id, articleId: eauPlate.id },
      { slotId: essEau.id, articleId: eauPetillante.id },
    ],
  });

  // ========== FORMULE GOURMAND (Groupe) ==========
  const gourmand = await prisma.formule.create({
    data: { nom: "Gourmand", prix: 13.5, categorieId: groupe.id },
  });
  const gouBoisson = await prisma.slot.create({
    data: { nom: "Boissons chaudes", formuleId: gourmand.id },
  });
  const gouViennoiserie = await prisma.slot.create({
    data: { nom: "Mini viennoiseries", formuleId: gourmand.id },
  });
  const gouDessert = await prisma.slot.create({
    data: { nom: "Desserts fermiers", formuleId: gourmand.id },
  });
  const gouCanele = await prisma.slot.create({
    data: { nom: "Mini canelés", formuleId: gourmand.id },
  });
  const gouJus = await prisma.slot.create({
    data: { nom: "Jus de fruits", formuleId: gourmand.id },
  });
  const gouEau = await prisma.slot.create({
    data: { nom: "Eau", formuleId: gourmand.id },
  });

  await prisma.slotArticle.createMany({
    data: [
      { slotId: gouBoisson.id, articleId: cafe.id },
      { slotId: gouBoisson.id, articleId: the.id },
      { slotId: gouBoisson.id, articleId: infusion.id },
      { slotId: gouViennoiserie.id, articleId: croissant.id },
      { slotId: gouViennoiserie.id, articleId: painChoco.id },
      { slotId: gouViennoiserie.id, articleId: chausson.id },
      { slotId: gouDessert.id, articleId: yaourt.id },
      { slotId: gouDessert.id, articleId: fromBlanc.id },
      { slotId: gouCanele.id, articleId: caneleNature.id },
      { slotId: gouCanele.id, articleId: caneleChoco.id },
      { slotId: gouJus.id, articleId: jusOrange.id },
      { slotId: gouJus.id, articleId: jusPomme.id },
      { slotId: gouJus.id, articleId: jusMangue.id },
      { slotId: gouEau.id, articleId: eauPlate.id },
      { slotId: gouEau.id, articleId: eauPetillante.id },
    ],
  });

  // ========== FORMULE PREMIUM (Groupe) ==========
  const premium = await prisma.formule.create({
    data: { nom: "Premium", prix: 34.9, categorieId: groupe.id },
  });
  const preBoisson = await prisma.slot.create({
    data: { nom: "Boissons chaudes", formuleId: premium.id },
  });
  const preViennoiserie = await prisma.slot.create({
    data: { nom: "Mini viennoiseries", formuleId: premium.id },
  });
  const preDessert = await prisma.slot.create({
    data: { nom: "Desserts fermiers", formuleId: premium.id },
  });
  const preCanele = await prisma.slot.create({
    data: { nom: "Mini canelés", formuleId: premium.id },
  });
  const prePlateau = await prisma.slot.create({
    data: { nom: "Plateau fromages & charcuteries", formuleId: premium.id },
  });
  const preFruits = await prisma.slot.create({
    data: { nom: "Plateau de fruits frais", formuleId: premium.id },
  });
  const preJus = await prisma.slot.create({
    data: { nom: "Jus de fruits", formuleId: premium.id },
  });
  const preEau = await prisma.slot.create({
    data: { nom: "Eau", formuleId: premium.id },
  });

  await prisma.slotArticle.createMany({
    data: [
      { slotId: preBoisson.id, articleId: cafe.id },
      { slotId: preBoisson.id, articleId: the.id },
      { slotId: preBoisson.id, articleId: infusion.id },
      { slotId: preViennoiserie.id, articleId: croissant.id },
      { slotId: preViennoiserie.id, articleId: painChoco.id },
      { slotId: preViennoiserie.id, articleId: chausson.id },
      { slotId: preDessert.id, articleId: yaourt.id },
      { slotId: preDessert.id, articleId: fromBlanc.id },
      { slotId: preCanele.id, articleId: caneleNature.id },
      { slotId: preCanele.id, articleId: caneleChoco.id },
      { slotId: prePlateau.id, articleId: plateauFromage.id },
      { slotId: prePlateau.id, articleId: plateauCharcuterie.id },
      { slotId: prePlateau.id, articleId: plateauMixte.id },
      { slotId: preFruits.id, articleId: plateauFruits.id },
      { slotId: preJus.id, articleId: jusOrange.id },
      { slotId: preJus.id, articleId: jusPomme.id },
      { slotId: preJus.id, articleId: jusMangue.id },
      { slotId: preEau.id, articleId: eauPlate.id },
      { slotId: preEau.id, articleId: eauPetillante.id },
    ],
  });
  // ========== EXTRAS ==========
  await prisma.extra.createMany({
    data: [
      { nom: "Café supplémentaire", prix: 2.5 },
      { nom: "Thé supplémentaire", prix: 2.5 },
      { nom: "Croissant supplémentaire", prix: 2.0 },
      { nom: "Jus d'orange supplémentaire", prix: 3.0 },
      { nom: "Yaourt fermier", prix: 2.5 },
      { nom: "Pain au chocolat", prix: 2.0 },
    ],
  });
  console.log("Base de données initialisée avec succès ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
