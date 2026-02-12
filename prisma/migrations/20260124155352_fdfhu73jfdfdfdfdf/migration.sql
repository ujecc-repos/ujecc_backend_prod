-- AlterTable
ALTER TABLE `User` ADD COLUMN `ministryId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_ministryId_fkey` FOREIGN KEY (`ministryId`) REFERENCES `ministry`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
