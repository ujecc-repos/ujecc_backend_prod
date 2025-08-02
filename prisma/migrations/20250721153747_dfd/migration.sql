/*
  Warnings:

  - You are about to drop the column `missionId` on the `Church` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Church` DROP FOREIGN KEY `Church_missionId_fkey`;

-- DropIndex
DROP INDEX `Church_missionId_fkey` ON `Church`;

-- AlterTable
ALTER TABLE `Church` DROP COLUMN `missionId`,
    ADD COLUMN `mission` VARCHAR(191) NULL;
