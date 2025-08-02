/*
  Warnings:

  - Added the required column `address` to the `pasteur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `pasteur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `pasteur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pasteur` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL;
