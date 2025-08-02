/*
  Warnings:

  - You are about to drop the column `churchId` on the `transfert` table. All the data in the column will be lost.
  - You are about to drop the column `churchName` on the `transfert` table. All the data in the column will be lost.
  - You are about to drop the column `groupName` on the `transfert` table. All the data in the column will be lost.
  - You are about to drop the column `transferedChurch` on the `transfert` table. All the data in the column will be lost.
  - You are about to drop the column `transferedGroup` on the `transfert` table. All the data in the column will be lost.
  - You are about to drop the column `transferedUserName` on the `transfert` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `transfert` table. All the data in the column will be lost.
  - Added the required column `fromChurchId` to the `transfert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toChurchId` to the `transfert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `transfert` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `transfert` DROP FOREIGN KEY `transfert_churchId_fkey`;

-- DropIndex
DROP INDEX `transfert_churchId_fkey` ON `transfert`;

-- AlterTable
ALTER TABLE `transfert` DROP COLUMN `churchId`,
    DROP COLUMN `churchName`,
    DROP COLUMN `groupName`,
    DROP COLUMN `transferedChurch`,
    DROP COLUMN `transferedGroup`,
    DROP COLUMN `transferedUserName`,
    DROP COLUMN `userName`,
    ADD COLUMN `fromChurchId` VARCHAR(191) NOT NULL,
    ADD COLUMN `toChurchId` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `transfert` ADD CONSTRAINT `transfert_fromChurchId_fkey` FOREIGN KEY (`fromChurchId`) REFERENCES `Church`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfert` ADD CONSTRAINT `transfert_toChurchId_fkey` FOREIGN KEY (`toChurchId`) REFERENCES `Church`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfert` ADD CONSTRAINT `transfert_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
