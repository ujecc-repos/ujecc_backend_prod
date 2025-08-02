/*
  Warnings:

  - You are about to drop the column `batismLocation` on the `Baptism` table. All the data in the column will be lost.
  - Added the required column `baptismLocation` to the `Baptism` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Baptism` DROP COLUMN `batismLocation`,
    ADD COLUMN `baptismLocation` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NULL;
