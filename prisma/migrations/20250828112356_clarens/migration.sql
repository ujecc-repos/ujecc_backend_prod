-- AlterTable
ALTER TABLE `User` ADD COLUMN `istimothee` BOOLEAN NULL,
    ADD COLUMN `timotheeId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Tti` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tti` ADD CONSTRAINT `Tti_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_timotheeId_fkey` FOREIGN KEY (`timotheeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
