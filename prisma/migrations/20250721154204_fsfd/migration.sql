/*
  Warnings:

  - You are about to drop the column `mission` on the `Church` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Church` DROP COLUMN `mission`,
    ADD COLUMN `missionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `Mission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
