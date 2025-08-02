-- AlterTable
ALTER TABLE `User` ADD COLUMN `addressLine` VARCHAR(191) NULL,
    ADD COLUMN `homePhone` VARCHAR(191) NULL,
    ADD COLUMN `joinDate` VARCHAR(191) NULL,
    ADD COLUMN `mobilePhone` VARCHAR(191) NULL,
    MODIFY `baptismDate` VARCHAR(191) NULL,
    MODIFY `birthDate` VARCHAR(191) NULL;
