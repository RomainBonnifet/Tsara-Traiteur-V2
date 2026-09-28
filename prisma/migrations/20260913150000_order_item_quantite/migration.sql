-- Repartition par quantites : une ligne "Cafe x 12" remplace douze lignes
-- "Cafe" identiques. DEFAULT 1 rend les commandes existantes correctes,
-- puisque chaque ligne deja enregistree valait exactement une unite.
ALTER TABLE "OrderItem" ADD COLUMN "quantite" INTEGER NOT NULL DEFAULT 1;
