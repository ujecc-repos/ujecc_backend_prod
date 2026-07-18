-- Add indexes used by the messaging contact search. The endpoint uses
-- prefix matching so MySQL can use these indexes on very large user tables.
CREATE INDEX `User_firstname_idx` ON `User`(`firstname`);
CREATE INDEX `User_lastname_idx` ON `User`(`lastname`);
