-- Renommage de "Individuel" en "Petit-dejeuner" et suppression de "Groupe".
--
-- Aucune colonne ne change : ce sont des DONNEES. On passe malgre tout par
-- une migration et non par un script, parce que le changement doit etre
-- atomique avec le deploiement du code. components/Formules.tsx indexe son
-- habillage par le NOM de la categorie : si la base disait encore
-- "Individuel" pendant que le nouveau code cherche "Petit-dejeuner", la
-- section de la page d'accueil perdrait son titre et son introduction.

-- 1. Renommage.
--    Le garde-fou NOT EXISTS evite une violation de la contrainte UNIQUE sur
--    "nom" si le nom cible existait deja (base modifiee a la main, migration
--    rejouee sur un environnement deja traite).
UPDATE "Categorie"
SET "nom" = 'Petit-déjeuner'
WHERE "nom" = 'Individuel'
  AND NOT EXISTS (SELECT 1 FROM "Categorie" c2 WHERE c2."nom" = 'Petit-déjeuner');

-- 2. Suppression de "Groupe".
--    Les buffets de groupe ne sont plus vendus en ligne : ils passent par un
--    devis personnalise via le formulaire de contact.
--    Le NOT EXISTS n'est pas une precaution decorative : "Formule.categorieId"
--    est NOT NULL, donc une formule encore rattachee ferait echouer le DELETE
--    sur une violation de cle etrangere et ferait echouer TOUT le deploiement.
--    On prefere ne rien supprimer dans ce cas : la categorie reste visible
--    dans le dashboard, ou l'admin traitera ses formules avant de reessayer.
--    (Les extras eventuellement rattaches passent a NULL, donc "proposes
--    pour toutes les formules" : c'est le ON DELETE SET NULL de leur cle.)
DELETE FROM "Categorie" c
WHERE c."nom" = 'Groupe'
  AND NOT EXISTS (SELECT 1 FROM "Formule" f WHERE f."categorieId" = c."id");
