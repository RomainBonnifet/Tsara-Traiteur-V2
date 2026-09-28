-- Visibilite d une categorie sur le site public.
--
-- DEFAULT true : toutes les categories existantes restent visibles, sauf
-- celle qu on masque explicitement juste apres.
ALTER TABLE "Categorie" ADD COLUMN "visiblePublic" BOOLEAN NOT NULL DEFAULT true;

-- Les buffets de groupe ne sont plus vendus en libre-service : ils passent
-- par un devis personnalise (decision du client, sept. 2026).
--
-- La migration 20260915160000 tentait de SUPPRIMER cette categorie, mais son
-- garde-fou l en a empechee en production : des formules y sont encore
-- rattachees, et des commandes y renvoient. On la masque donc au lieu de la
-- detruire — l historique des commandes reste lisible dans le dashboard.
UPDATE "Categorie" SET "visiblePublic" = false WHERE "nom" = 'Groupe';
