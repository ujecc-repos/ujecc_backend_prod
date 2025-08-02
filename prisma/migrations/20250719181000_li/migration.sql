/*
  Warnings:

  - You are about to drop the column `maxAge` on the `sundayClass` table. All the data in the column will be lost.
  - You are about to drop the column `minAge` on the `sundayClass` table. All the data in the column will be lost.
  - Added the required column `ageGroup` to the `sundayClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sundayClass` DROP COLUMN `maxAge`,
    DROP COLUMN `minAge`,
    ADD COLUMN `ageGroup` VARCHAR(191) NOT NULL;
