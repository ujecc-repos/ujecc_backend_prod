CREATE TABLE `Visitor` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `firstname` VARCHAR(191) NOT NULL,
  `lastname` VARCHAR(191) NOT NULL,
  `gender` VARCHAR(191) NULL,
  `mobilePhone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `addressLine` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `firstVisitDate` VARCHAR(191) NOT NULL,
  `lastVisitDate` VARCHAR(191) NOT NULL,
  `discoverySource` VARCHAR(191) NULL,
  `invitedBy` VARCHAR(191) NULL,
  `visitReason` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Nouveau',
  `nextFollowUpDate` VARCHAR(191) NULL,
  `isAffiliated` BOOLEAN NOT NULL DEFAULT false,
  `churchId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Visitor_code_key`(`code`),
  INDEX `Visitor_churchId_createdAt_idx`(`churchId`, `createdAt`),
  INDEX `Visitor_churchId_status_idx`(`churchId`, `status`),
  INDEX `Visitor_churchId_lastVisitDate_idx`(`churchId`, `lastVisitDate`),
  INDEX `Visitor_churchId_firstname_idx`(`churchId`, `firstname`),
  INDEX `Visitor_churchId_lastname_idx`(`churchId`, `lastname`),
  INDEX `Visitor_churchId_mobilePhone_idx`(`churchId`, `mobilePhone`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Visitor`
ADD CONSTRAINT `Visitor_churchId_fkey`
FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
