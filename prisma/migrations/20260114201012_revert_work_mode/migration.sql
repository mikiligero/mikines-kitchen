/*
  Warnings:

  - You are about to drop the `WorkProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkProvider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkProject";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkProvider";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkTask";
PRAGMA foreign_keys=on;
