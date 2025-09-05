-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('Admin', 'Membre', 'SuperAdmin', 'Directeur', 'Invite') NOT NULL DEFAULT 'Membre';
