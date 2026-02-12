/*
  Warnings:

  - You are about to drop the column `foundationDate` on the `Church` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Church` DROP COLUMN `foundationDate`,
    ADD COLUMN `foundationYear` VARCHAR(191) NULL;
