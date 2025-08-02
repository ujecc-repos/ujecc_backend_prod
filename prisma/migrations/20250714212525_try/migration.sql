/*
  Warnings:

  - You are about to drop the column `dateService` on the `death` table. All the data in the column will be lost.
  - You are about to drop the column `familyContact` on the `death` table. All the data in the column will be lost.
  - You are about to drop the column `locationService` on the `death` table. All the data in the column will be lost.
  - You are about to drop the column `medicalReport` on the `death` table. All the data in the column will be lost.
  - You are about to drop the column `specialInstruction` on the `death` table. All the data in the column will be lost.
  - Added the required column `deathTime` to the `death` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `death` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextOfkin` to the `death` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officiantName` to the `death` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationShip` to the `death` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceDate` to the `death` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `death` DROP COLUMN `dateService`,
    DROP COLUMN `familyContact`,
    DROP COLUMN `locationService`,
    DROP COLUMN `medicalReport`,
    DROP COLUMN `specialInstruction`,
    ADD COLUMN `deathTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `nextOfkin` VARCHAR(191) NOT NULL,
    ADD COLUMN `officiantName` VARCHAR(191) NOT NULL,
    ADD COLUMN `relationShip` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceDate` DATETIME(3) NOT NULL;
