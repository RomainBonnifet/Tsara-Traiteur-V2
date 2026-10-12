-- Ordre d affichage des photos, reglable depuis le dashboard.
ALTER TABLE "Photo" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Rattrapage : sans lui, toutes les photos seraient a 0 et l ordre
-- actuel du site serait perdu. On fige l ordre affiche jusqu ici, soit
-- la plus recente en premier.
--
-- ROW_NUMBER() numerote les lignes selon le tri demande ; le -1 ramene
-- la numerotation a 0, comme le fait le code.
WITH ordonnees AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" DESC, "id" DESC) - 1 AS rang
  FROM "Photo"
)
UPDATE "Photo" p
SET "position" = o.rang
FROM ordonnees o
WHERE o."id" = p."id";
