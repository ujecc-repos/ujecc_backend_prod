/*
  Warnings:

  - Added the required column `churchId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Service` ADD COLUMN `churchId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
