-- Langue du client au moment de la commande.
-- Sert a envoyer l email de confirmation dans la bonne langue, y compris
-- depuis le webhook Stripe ou le cookie du navigateur n est plus lisible.
-- DEFAULT 'fr' : les commandes existantes ont toutes ete passees en francais.
ALTER TABLE "Order" ADD COLUMN "langue" TEXT NOT NULL DEFAULT 'fr';
