/*
  Warnings:

  - You are about to drop the column `status` on the `moisson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `moisson` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `offering` ADD COLUMN `status` VARCHAR(191) NULL;
