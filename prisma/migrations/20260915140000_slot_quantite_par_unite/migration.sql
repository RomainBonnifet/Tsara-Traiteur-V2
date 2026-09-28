-- Nombre d'exemplaires de ce creneau par personne ou par plateau.
-- DEFAULT 1 : tous les creneaux existants gardent un comportement
-- rigoureusement identique, aucun rattrapage de donnees n'est necessaire.
-- Complementaire de "capacite", qui divise la ou celle-ci multiplie.
ALTER TABLE "Slot" ADD COLUMN "quantiteParUnite" INTEGER NOT NULL DEFAULT 1;
