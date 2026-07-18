-- Store the creator/administrator of a group conversation.
ALTER TABLE `Conversation` ADD COLUMN `ownerId` VARCHAR(191) NULL;

CREATE INDEX `Conversation_ownerId_idx` ON `Conversation`(`ownerId`);

ALTER TABLE `Conversation`
ADD CONSTRAINT `Conversation_ownerId_fkey`
FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
