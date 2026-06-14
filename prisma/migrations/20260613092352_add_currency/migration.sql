-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'aniversare',
    "date" DATETIME,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MDL',
    "totalBudget" REAL NOT NULL DEFAULT 0,
    "musicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "videoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("createdAt", "date", "description", "id", "musicEnabled", "name", "totalBudget", "type", "updatedAt", "videoEnabled") SELECT "createdAt", "date", "description", "id", "musicEnabled", "name", "totalBudget", "type", "updatedAt", "videoEnabled" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
