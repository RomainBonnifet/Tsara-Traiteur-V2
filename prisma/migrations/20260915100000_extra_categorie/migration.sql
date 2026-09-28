-- 1. La colonne, NULLABLE : NULL signifie "extra propose pour toutes les
--    formules". Une colonne NOT NULL obligerait a inventer une valeur pour
--    les extras deja enregistres.
ALTER TABLE "Extra" ADD COLUMN "categorieId" INTEGER;

-- 2. La cle etrangere. ON DELETE SET NULL : si le traiteur supprime une
--    categorie, ses extras redeviennent universels au lieu d'etre detruits
--    (ON DELETE CASCADE) ou de bloquer la suppression (RESTRICT).
ALTER TABLE "Extra"
  ADD CONSTRAINT "Extra_categorieId_fkey"
  FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Rattrapage des donnees existantes.
--    Tous les extras crees jusqu'ici sont des produits de petit-dejeuner
--    (croissants, jus, riz au lait) : sans ce rattrapage ils resteraient
--    "universels" et continueraient d'apparaitre sur les formules Apero,
--    ce qui est precisement le probleme que cette migration corrige.
--    La sous-requete cible la categorie par son NOM : si elle n'existe pas
--    sous ce nom, l'UPDATE ne touche rien plutot que d'echouer.
--    Le traiteur peut reclasser chaque extra depuis le dashboard.
UPDATE "Extra"
SET "categorieId" = (SELECT "id" FROM "Categorie" WHERE "nom" = 'Individuel')
WHERE "categorieId" IS NULL
  AND EXISTS (SELECT 1 FROM "Categorie" WHERE "nom" = 'Individuel');
