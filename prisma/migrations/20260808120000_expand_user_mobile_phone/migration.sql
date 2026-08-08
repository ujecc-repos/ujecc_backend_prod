-- Preserve the existing values while allowing several phone numbers in one string.
ALTER TABLE `User`
    MODIFY `mobilePhone` TEXT NULL;
