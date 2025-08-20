/*
  Warnings:

  - You are about to drop the column `evenementId` on the `Presence` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Presence` table. All the data in the column will be lost.
  - Added the required column `serviceId` to the `Presence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Presence` DROP FOREIGN KEY `Presence_evenementId_fkey`;

-- DropIndex
DROP INDEX `Presence_evenementId_fkey` ON `Presence`;

-- AlterTable
ALTER TABLE `Presence` DROP COLUMN `evenementId`,
    DROP COLUMN `notes`,
    ADD COLUMN `serviceId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Presence` ADD CONSTRAINT `Presence_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
