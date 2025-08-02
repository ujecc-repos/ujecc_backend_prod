/*
  Warnings:

  - You are about to drop the column `address` on the `Baptism` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Baptism` table. All the data in the column will be lost.
  - Added the required column `status` to the `Baptism` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Baptism` DROP COLUMN `address`,
    DROP COLUMN `phone`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL;
