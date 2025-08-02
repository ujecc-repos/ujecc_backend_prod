-- AlterTable
ALTER TABLE `Groups` ADD COLUMN `maxAge` INTEGER NULL,
    ADD COLUMN `maxNumber` INTEGER NULL,
    ADD COLUMN `meetingDays` JSON NULL,
    ADD COLUMN `meetingFrequency` VARCHAR(191) NULL,
    ADD COLUMN `meetingLocation` VARCHAR(191) NULL,
    ADD COLUMN `meetingTime` DATETIME(3) NULL,
    ADD COLUMN `minAge` INTEGER NULL,
    ADD COLUMN `visibility` JSON NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `membreActif` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `sundayClass` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `teacher` VARCHAR(191) NOT NULL,
    `minAge` VARCHAR(191) NOT NULL,
    `maxAge` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `Location` VARCHAR(191) NOT NULL,
    `maxStudent` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense` (
    `id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offering` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tithing` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comitee` (
    `id` VARCHAR(191) NOT NULL,
    `comiteeName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `meetingDay` JSON NOT NULL,
    `meetingTime` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ComiteeLeaders` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ComiteeLeaders_AB_unique`(`A`, `B`),
    INDEX `_ComiteeLeaders_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ComiteeMembers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ComiteeMembers_AB_unique`(`A`, `B`),
    INDEX `_ComiteeMembers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sundayClass` ADD CONSTRAINT `sundayClass_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeLeaders` ADD CONSTRAINT `_ComiteeLeaders_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeLeaders` ADD CONSTRAINT `_ComiteeLeaders_B_fkey` FOREIGN KEY (`B`) REFERENCES `comitee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeMembers` ADD CONSTRAINT `_ComiteeMembers_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeMembers` ADD CONSTRAINT `_ComiteeMembers_B_fkey` FOREIGN KEY (`B`) REFERENCES `comitee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
