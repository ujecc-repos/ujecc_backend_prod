/*
  Warnings:

  - You are about to drop the column `conversationDate` on the `Baptism` table. All the data in the column will be lost.
  - Added the required column `conversionDate` to the `Baptism` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Baptism` DROP COLUMN `conversationDate`,
    ADD COLUMN `conversionDate` DATETIME(3) NOT NULL;
