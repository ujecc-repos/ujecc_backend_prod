/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[password]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `name`,
    ADD COLUMN `baptismDate` DATETIME(3) NULL,
    ADD COLUMN `baptismLocation` VARCHAR(191) NULL,
    ADD COLUMN `birthCity` VARCHAR(191) NULL,
    ADD COLUMN `birthCountry` VARCHAR(191) NULL,
    ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `churchId` VARCHAR(191) NULL,
    ADD COLUMN `churchRole` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `envelopeNumber` VARCHAR(191) NULL,
    ADD COLUMN `etatCivil` VARCHAR(191) NULL,
    ADD COLUMN `facebook` VARCHAR(191) NULL,
    ADD COLUMN `firstname` VARCHAR(191) NOT NULL,
    ADD COLUMN `instagram` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `picture` VARCHAR(191) NULL,
    ADD COLUMN `profession` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('Admin', 'Membre', 'Leader') NOT NULL DEFAULT 'Membre',
    ADD COLUMN `sex` VARCHAR(191) NULL,
    ADD COLUMN `sundayClass` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Church` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL DEFAULT '1',
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `anthem` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `whatssap` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Church_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mariage` (
    `id` VARCHAR(191) NOT NULL,
    `brideFullname` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `groomFullname` VARCHAR(191) NOT NULL,
    `goomBirthDate` DATETIME(3) NOT NULL,
    `weddingDate` DATETIME(3) NOT NULL,
    `weddingLocation` VARCHAR(191) NOT NULL,
    `weddingCertificate` VARCHAR(191) NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Funeral` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `funeralDate` DATETIME(3) NOT NULL,
    `funeralTime` VARCHAR(191) NOT NULL,
    `relationShip` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `deathCause` VARCHAR(191) NOT NULL,
    `deathCertificate` VARCHAR(191) NULL,
    `nextOfKin` VARCHAR(191) NOT NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `funeralLocation` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presentation` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `birthCertificate` VARCHAR(191) NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `presentationDate` DATETIME(3) NOT NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `witnessName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Baptism` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `baptismDate` DATETIME(3) NOT NULL,
    `batismLocation` VARCHAR(191) NOT NULL,
    `baptismCertificate` VARCHAR(191) NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `withness` VARCHAR(191) NOT NULL,
    `conversationDate` VARCHAR(191) NOT NULL,
    `previousChurch` VARCHAR(191) NOT NULL,
    `testimony` VARCHAR(191) NOT NULL,
    `baptismClassDate` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `death` (
    `id` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `deathDate` DATETIME(3) NOT NULL,
    `Mermbership` INTEGER NOT NULL,
    `churchRole` INTEGER NOT NULL,
    `deathPlace` VARCHAR(191) NOT NULL,
    `deathCause` VARCHAR(191) NOT NULL,
    `deathCertificate` VARCHAR(191) NULL,
    `medicalReport` VARCHAR(191) NOT NULL,
    `dateService` DATETIME(3) NOT NULL,
    `locationService` VARCHAR(191) NOT NULL,
    `familyContact` VARCHAR(191) NOT NULL,
    `specialInstruction` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GroupsToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_GroupsToUser_AB_unique`(`A`, `B`),
    INDEX `_GroupsToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_password_key` ON `User`(`password`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Groups` ADD CONSTRAINT `Groups_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mariage` ADD CONSTRAINT `Mariage_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Funeral` ADD CONSTRAINT `Funeral_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presentation` ADD CONSTRAINT `Presentation_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baptism` ADD CONSTRAINT `Baptism_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `death` ADD CONSTRAINT `death_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupsToUser` ADD CONSTRAINT `_GroupsToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupsToUser` ADD CONSTRAINT `_GroupsToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
