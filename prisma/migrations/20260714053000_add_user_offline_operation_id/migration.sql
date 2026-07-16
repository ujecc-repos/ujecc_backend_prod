-- Make retried offline member creation safe after a reload, tab close, or lost response.
ALTER TABLE `User` ADD COLUMN `offlineOperationId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `User_offlineOperationId_key` ON `User`(`offlineOperationId`);
