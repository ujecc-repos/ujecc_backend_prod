-- Preserve existing emergency-contact numbers while allowing several in one string.
ALTER TABLE `User`
    MODIFY `homePhone` TEXT NULL;
