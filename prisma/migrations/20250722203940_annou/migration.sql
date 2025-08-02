-- AlterTable
ALTER TABLE `Event` ADD COLUMN `endPeriode` VARCHAR(191) NULL,
    ADD COLUMN `startPeriode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `moisson` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'en attente';
