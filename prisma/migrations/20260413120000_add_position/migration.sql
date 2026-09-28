-- Migration reconstituée a posteriori.
-- Ces colonnes ont été ajoutées le 13/04/2026 (commits 910334b et a3c6bd5)
-- directement en base, sans passer par l'historique de migrations.
-- Elle existe pour que l'historique décrive fidèlement la base réelle :
-- sur une base qui possède DÉJÀ ces colonnes, elle doit être marquée
-- appliquée avec `prisma migrate resolve --applied`, jamais exécutée.

-- AlterTable
ALTER TABLE "Formule" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Slot" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
