/*
  Warnings:

  - A unique constraint covering the columns `[addressId]` on the table `Church` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Church` ADD COLUMN `addressId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `departement` VARCHAR(191) NULL,
    `commune` VARCHAR(191) NULL,
    `sectionCommunale` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NULL,
    `rue` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Church_addressId_key` ON `Church`(`addressId`);

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
