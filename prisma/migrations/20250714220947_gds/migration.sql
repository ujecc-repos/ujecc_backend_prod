/*
  Warnings:

  - You are about to drop the column `Mermbership` on the `death` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `death` table. All the data in the column will be lost.
  - You are about to drop the column `churchRole` on the `death` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `death` DROP COLUMN `Mermbership`,
    DROP COLUMN `birthDate`,
    DROP COLUMN `churchRole`;
