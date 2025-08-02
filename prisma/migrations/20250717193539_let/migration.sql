/*
  Warnings:

  - You are about to drop the column `maxAge` on the `Groupe` table. All the data in the column will be lost.
  - You are about to drop the column `minAge` on the `Groupe` table. All the data in the column will be lost.
  - You are about to drop the column `ministry` on the `Groupe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Groupe` DROP COLUMN `maxAge`,
    DROP COLUMN `minAge`,
    DROP COLUMN `ministry`,
    ADD COLUMN `ageGroup` VARCHAR(191) NULL,
    ADD COLUMN `minister` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `minister` VARCHAR(191) NULL;
