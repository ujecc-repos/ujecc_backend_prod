-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_churchId_fkey`;

-- DropIndex
DROP INDEX `Service_churchId_fkey` ON `Service`;

-- AlterTable
ALTER TABLE `Service` MODIFY `churchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
