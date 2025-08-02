-- AlterTable
ALTER TABLE `comitee` ADD COLUMN `churchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `comitee` ADD CONSTRAINT `comitee_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
