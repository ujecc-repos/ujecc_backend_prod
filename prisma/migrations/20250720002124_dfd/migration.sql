-- AlterTable
ALTER TABLE `expense` ADD COLUMN `churchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
