-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Formule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "minPersonnes" INTEGER NOT NULL DEFAULT 1,
    "pasPersonnes" INTEGER NOT NULL DEFAULT 1,
    "categorieId" INTEGER NOT NULL,
    CONSTRAINT "Formule_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Formule" ("categorieId", "description", "id", "image", "nom", "prix") SELECT "categorieId", "description", "id", "image", "nom", "prix" FROM "Formule";
DROP TABLE "Formule";
ALTER TABLE "new_Formule" RENAME TO "Formule";
CREATE TABLE "new_Slot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL DEFAULT 1,
    "formuleId" INTEGER NOT NULL,
    CONSTRAINT "Slot_formuleId_fkey" FOREIGN KEY ("formuleId") REFERENCES "Formule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Slot" ("formuleId", "id", "nom") SELECT "formuleId", "id", "nom" FROM "Slot";
DROP TABLE "Slot";
ALTER TABLE "new_Slot" RENAME TO "Slot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
