/*
  Warnings:

  - You are about to drop the column `churchId` on the `Tti` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Tti` DROP FOREIGN KEY `Tti_churchId_fkey`;

-- DropIndex
DROP INDEX `Tti_churchId_fkey` ON `Tti`;

-- AlterTable
ALTER TABLE `Church` ADD COLUMN `ttiId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Tti` DROP COLUMN `churchId`;

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_ttiId_fkey` FOREIGN KEY (`ttiId`) REFERENCES `Tti`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
