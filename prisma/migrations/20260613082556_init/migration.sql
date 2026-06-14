-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'aniversare',
    "date" DATETIME,
    "description" TEXT,
    "totalBudget" REAL NOT NULL DEFAULT 0,
    "musicEnabled" BOOLEAN NOT NULL DEFAULT false,
    "videoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "eventId" TEXT NOT NULL,
    CONSTRAINT "Organizer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_asteptare',
    "companions" INTEGER NOT NULL DEFAULT 0,
    "tableName" TEXT,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'idee',
    "link" TEXT,
    "eventId" TEXT NOT NULL,
    "organizerId" TEXT,
    CONSTRAINT "Gift_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Gift_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'fel_principal',
    "quantity" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "MenuItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "capacity" INTEGER,
    "cost" REAL NOT NULL DEFAULT 0,
    "contact" TEXT,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "Venue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'planificare',
    "status" TEXT NOT NULL DEFAULT 'de_facut',
    "dueDate" DATETIME,
    "eventId" TEXT NOT NULL,
    "organizerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'sala',
    "planned" REAL NOT NULL DEFAULT 0,
    "actual" REAL NOT NULL DEFAULT 0,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "BudgetItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "service" TEXT NOT NULL DEFAULT 'altul',
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'de_contactat',
    "cost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "Vendor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Organizer_eventId_idx" ON "Organizer"("eventId");

-- CreateIndex
CREATE INDEX "Guest_eventId_idx" ON "Guest"("eventId");

-- CreateIndex
CREATE INDEX "Gift_eventId_idx" ON "Gift"("eventId");

-- CreateIndex
CREATE INDEX "MenuItem_eventId_idx" ON "MenuItem"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_eventId_key" ON "Venue"("eventId");

-- CreateIndex
CREATE INDEX "Task_eventId_idx" ON "Task"("eventId");

-- CreateIndex
CREATE INDEX "BudgetItem_eventId_idx" ON "BudgetItem"("eventId");

-- CreateIndex
CREATE INDEX "Vendor_eventId_idx" ON "Vendor"("eventId");
