/*
  Warnings:

  - Added the required column `civilStateOfficer` to the `Mariage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `witness` to the `Mariage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Mariage` ADD COLUMN `brideCertificate` VARCHAR(191) NULL,
    ADD COLUMN `civilStateOfficer` VARCHAR(191) NOT NULL,
    ADD COLUMN `grooomCertificate` VARCHAR(191) NULL,
    ADD COLUMN `witness` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('Admin', 'Membre', 'superAdmin', 'Leader') NOT NULL DEFAULT 'Membre';
