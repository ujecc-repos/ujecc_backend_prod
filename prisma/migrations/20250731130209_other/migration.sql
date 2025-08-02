/*
  Warnings:

  - You are about to drop the column `endDate` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Mission` DROP COLUMN `endDate`,
    DROP COLUMN `startDate`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `latitude` VARCHAR(191) NULL,
    ADD COLUMN `longitude` VARCHAR(191) NULL,
    ADD COLUMN `nif` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `expense` DROP COLUMN `quantity`;
