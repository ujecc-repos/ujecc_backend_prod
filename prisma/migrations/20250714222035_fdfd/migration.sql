/*
  Warnings:

  - You are about to drop the column `nextOfkin` on the `death` table. All the data in the column will be lost.
  - Added the required column `nextOfKin` to the `death` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `death` DROP COLUMN `nextOfkin`,
    ADD COLUMN `nextOfKin` VARCHAR(191) NOT NULL;
