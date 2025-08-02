/*
  Warnings:

  - You are about to drop the `Groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupsToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Groups` DROP FOREIGN KEY `Groups_churchId_fkey`;

-- DropForeignKey
ALTER TABLE `_GroupsToUser` DROP FOREIGN KEY `_GroupsToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_GroupsToUser` DROP FOREIGN KEY `_GroupsToUser_B_fkey`;

-- DropTable
DROP TABLE `Groups`;

-- DropTable
DROP TABLE `_GroupsToUser`;

-- CreateTable
CREATE TABLE `Groupe` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ministry` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `showToMembers` BOOLEAN NULL,
    `showToNonMembers` BOOLEAN NULL,
    `showMembers` BOOLEAN NULL,
    `showLeaders` BOOLEAN NULL,
    `meetingDays` VARCHAR(191) NULL,
    `meetingTime` DATETIME(3) NULL,
    `meetingLocation` VARCHAR(191) NULL,
    `meetingFrequency` VARCHAR(191) NULL,
    `minAge` INTEGER NULL,
    `maxAge` INTEGER NULL,
    `maxMembers` INTEGER NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GroupeToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_GroupeToUser_AB_unique`(`A`, `B`),
    INDEX `_GroupeToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Groupe` ADD CONSTRAINT `Groupe_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupeToUser` ADD CONSTRAINT `_GroupeToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Groupe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupeToUser` ADD CONSTRAINT `_GroupeToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
