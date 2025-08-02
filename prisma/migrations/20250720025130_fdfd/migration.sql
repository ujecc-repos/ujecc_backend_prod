/*
  Warnings:

  - You are about to drop the column `contributorName` on the `offering` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `donation` ADD COLUMN `churchId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `offering` DROP COLUMN `contributorName`,
    ADD COLUMN `churchId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tithing` ADD COLUMN `churchId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `moisson` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `offering` ADD CONSTRAINT `offering_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tithing` ADD CONSTRAINT `tithing_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation` ADD CONSTRAINT `donation_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moisson` ADD CONSTRAINT `moisson_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
