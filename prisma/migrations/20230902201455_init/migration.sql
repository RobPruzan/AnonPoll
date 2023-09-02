/*
  Warnings:

  - Added the required column `roomID` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomID" TEXT NOT NULL,
    "serializedJSON" TEXT NOT NULL
);
INSERT INTO "new_Action" ("id", "serializedJSON") SELECT "id", "serializedJSON" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
