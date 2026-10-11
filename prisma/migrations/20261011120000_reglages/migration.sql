-- Reglages du site, en une seule ligne.
CREATE TABLE "Reglages" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "commandesOuvertes" BOOLEAN NOT NULL DEFAULT true,
    "messagePause" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reglages_pkey" PRIMARY KEY ("id")
);

-- La ligne unique est creee ici plutot qu au premier acces : le site
-- public la lit a chaque affichage, il ne doit pas avoir a l ecrire.
-- ON CONFLICT DO NOTHING rend la migration rejouable sans erreur.
INSERT INTO "Reglages" ("id", "commandesOuvertes", "updatedAt")
VALUES (1, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
