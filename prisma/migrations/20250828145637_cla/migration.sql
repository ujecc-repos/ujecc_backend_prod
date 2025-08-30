-- DropForeignKey
ALTER TABLE `Tti` DROP FOREIGN KEY `Tti_churchId_fkey`;

-- DropIndex
DROP INDEX `Tti_churchId_fkey` ON `Tti`;

-- AlterTable
ALTER TABLE `Tti` MODIFY `churchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Tti` ADD CONSTRAINT `Tti_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
