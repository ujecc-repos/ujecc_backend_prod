/*
  Warnings:

  - You are about to drop the column `comiteeName` on the `comitee` table. All the data in the column will be lost.
  - Added the required column `name` to the `comitee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comitee` DROP COLUMN `comiteeName`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
