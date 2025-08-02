/*
  Warnings:

  - You are about to alter the column `conversationDate` on the `Baptism` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `baptismClassDate` on the `Baptism` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Baptism` MODIFY `conversationDate` DATETIME(3) NOT NULL,
    MODIFY `baptismClassDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Event` MODIFY `isRecurring` BOOLEAN NOT NULL DEFAULT true;
