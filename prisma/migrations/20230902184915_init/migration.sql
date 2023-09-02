/*
  Warnings:

  - You are about to drop the column `data` on the `Action` table. All the data in the column will be lost.
  - Added the required column `serializedJSON` to the `Action` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serializedJSON" TEXT NOT NULL
);
INSERT INTO "new_Action" ("id") SELECT "id" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
