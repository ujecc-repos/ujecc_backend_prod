-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presence` (
    `id` VARCHAR(191) NOT NULL,
    `statut` ENUM('PRESENT', 'ABSENT', 'EN_RETARD', 'MOTIVE') NOT NULL,
    `notes` VARCHAR(191) NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `evenementId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Presence` ADD CONSTRAINT `Presence_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presence` ADD CONSTRAINT `Presence_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
