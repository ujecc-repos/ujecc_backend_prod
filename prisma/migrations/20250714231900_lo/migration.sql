/*
  Warnings:

  - You are about to drop the column `birthDate` on the `Presentation` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Presentation` table. All the data in the column will be lost.
  - You are about to drop the column `witnessName` on the `Presentation` table. All the data in the column will be lost.
  - Added the required column `childName` to the `Presentation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `Presentation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `witness` to the `Presentation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Presentation` DROP COLUMN `birthDate`,
    DROP COLUMN `fullName`,
    DROP COLUMN `witnessName`,
    ADD COLUMN `childName` VARCHAR(191) NOT NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NOT NULL,
    ADD COLUMN `witness` VARCHAR(191) NOT NULL;
