-- Ordre d affichage des extras, reglable depuis le dashboard.
ALTER TABLE "Extra" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Rattrapage de l ordre existant : les extras etaient tries par id.
-- Sans ce rattrapage ils passeraient tous a 0, donc a egalite, et
-- l ordre affiche deviendrait arbitraire.
WITH ordonnees AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "id" ASC) - 1 AS rang
  FROM "Extra"
)
UPDATE "Extra" e
SET "position" = o.rang
FROM ordonnees o
WHERE o."id" = e."id";
