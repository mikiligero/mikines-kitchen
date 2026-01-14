-- CreateTable
CREATE TABLE "WorkProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "providerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkProject_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "WorkProvider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
    "importance" TEXT NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT,
    "dueDate" DATETIME,
    "projectId" TEXT,
    "providerId" TEXT,
    "parentId" TEXT,
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WorkProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkTask_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "WorkProvider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkTask_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
