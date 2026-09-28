-- L'unite de vente "plateau" devient "formule".
--
-- Le mot "plateau" designait a la fois l'unite de facturation et, bientot,
-- un produit physique du catalogue. Garder unite = 'plateau' en base tout
-- en affichant « formule » a l'ecran aurait cree un nom mensonger.
--
-- IDEMPOTENT : sur une base deja migree, le WHERE ne trouve aucune ligne.
UPDATE "Formule" SET "unite" = 'formule' WHERE "unite" = 'plateau';
