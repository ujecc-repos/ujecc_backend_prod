-- Prevent duplicate attendance records when an offline request is retried after interruption.
ALTER TABLE `Presence` ADD COLUMN `offlineOperationId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Presence_offlineOperationId_key` ON `Presence`(`offlineOperationId`);
