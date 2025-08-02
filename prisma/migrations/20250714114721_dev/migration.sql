/*
  Warnings:

  - You are about to drop the column `maxNumber` on the `Groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Groups` DROP COLUMN `maxNumber`,
    ADD COLUMN `maxMembers` INTEGER NULL,
    ADD COLUMN `ministry` VARCHAR(191) NULL,
    MODIFY `meetingDays` VARCHAR(191) NULL;
