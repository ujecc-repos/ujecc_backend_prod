-- The “Converti en membre” workflow is no longer part of visitor management.
-- Preserve existing records by moving them to the closest remaining status.
UPDATE `Visitor`
SET `status` = 'Revenu'
WHERE `status` = 'Converti en membre';
