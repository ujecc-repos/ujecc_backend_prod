/*
  Warnings:

  - The values [Director] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('Admin', 'Membre', 'SuperAdmin', 'Directeur') NOT NULL DEFAULT 'Membre';
