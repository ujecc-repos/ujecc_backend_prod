/*
  Warnings:

  - You are about to drop the column `visibility` on the `Groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Groups` DROP COLUMN `visibility`,
    ADD COLUMN `showLeaders` BOOLEAN NULL,
    ADD COLUMN `showMembers` BOOLEAN NULL,
    ADD COLUMN `showToMembers` BOOLEAN NULL,
    ADD COLUMN `showToNonMembers` BOOLEAN NULL;
