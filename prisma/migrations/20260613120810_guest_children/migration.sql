-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_asteptare',
    "companions" INTEGER NOT NULL DEFAULT 0,
    "children" INTEGER NOT NULL DEFAULT 0,
    "kidsTable" BOOLEAN NOT NULL DEFAULT false,
    "tableName" TEXT,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Guest" ("companions", "contact", "createdAt", "eventId", "id", "name", "notes", "status", "tableName") SELECT "companions", "contact", "createdAt", "eventId", "id", "name", "notes", "status", "tableName" FROM "Guest";
DROP TABLE "Guest";
ALTER TABLE "new_Guest" RENAME TO "Guest";
CREATE INDEX "Guest_eventId_idx" ON "Guest"("eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
