-- CreateTable
CREATE TABLE `pasteur` (
    `id` VARCHAR(191) NOT NULL,
    `pasteurName` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pasteur` ADD CONSTRAINT `pasteur_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
