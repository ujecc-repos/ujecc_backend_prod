/*
  Warnings:

  - You are about to drop the column `Location` on the `sundayClass` table. All the data in the column will be lost.
  - You are about to drop the column `maxStudent` on the `sundayClass` table. All the data in the column will be lost.
  - Added the required column `location` to the `sundayClass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxStudents` to the `sundayClass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sundayClass` DROP COLUMN `Location`,
    DROP COLUMN `maxStudent`,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `maxStudents` INTEGER NOT NULL;
