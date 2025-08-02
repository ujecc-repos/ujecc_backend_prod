/*
  Warnings:

  - You are about to drop the column `deathCause` on the `Funeral` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Funeral` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Funeral` DROP COLUMN `deathCause`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'en attente',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
