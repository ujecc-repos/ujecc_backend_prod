-- A funeral may concern an existing member or an external person.
ALTER TABLE `Funeral`
    ADD COLUMN `deathDate` DATETIME(3) NULL,
    ADD COLUMN `memberId` VARCHAR(191) NULL;

-- Keep the reason/date of inactivity available even if the funeral record is removed later.
ALTER TABLE `User`
    ADD COLUMN `deceasedAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `Funeral_memberId_key` ON `Funeral`(`memberId`);

ALTER TABLE `Funeral`
    ADD CONSTRAINT `Funeral_memberId_fkey`
    FOREIGN KEY (`memberId`) REFERENCES `User`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
