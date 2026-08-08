DROP INDEX `Visitor_churchId_lastVisitDate_idx` ON `Visitor`;

ALTER TABLE `Visitor`
CHANGE COLUMN `firstVisitDate` `visitDate` VARCHAR(191) NOT NULL;

ALTER TABLE `Visitor`
DROP COLUMN `lastVisitDate`;

CREATE INDEX `Visitor_churchId_visitDate_idx`
ON `Visitor`(`churchId`, `visitDate`);
