/*
  Warnings:

  - You are about to drop the column `whatssap` on the `Church` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Church` DROP COLUMN `whatssap`,
    ADD COLUMN `whatsapp` VARCHAR(191) NULL;
