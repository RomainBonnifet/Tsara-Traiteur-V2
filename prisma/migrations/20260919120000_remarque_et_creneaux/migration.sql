-- Remarque libre du client sur sa commande (allergies, alternatives...).
ALTER TABLE "Order" ADD COLUMN "remarque" TEXT;

-- Creneaux de livraison propres a chaque categorie. Le matin pour un
-- petit-dejeuner, le soir pour un plateau apero.
-- DEFAULT tableau vide : les categories existantes ne sont pas cassees, le
-- code retombe sur les creneaux par defaut tant que rien n'est renseigne.
ALTER TABLE "Categorie" ADD COLUMN "creneaux" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
