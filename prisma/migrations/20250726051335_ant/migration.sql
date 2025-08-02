/*
  Warnings:

  - You are about to drop the column `baptismClassDate` on the `Baptism` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Baptism` DROP COLUMN `baptismClassDate`,
    ADD COLUMN `endDate` VARCHAR(191) NULL,
    ADD COLUMN `startDate` VARCHAR(191) NULL;
