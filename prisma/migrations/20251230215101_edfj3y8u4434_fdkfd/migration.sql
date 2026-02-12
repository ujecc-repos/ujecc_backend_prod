-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    INDEX `Service_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presence` (
    `id` VARCHAR(191) NOT NULL,
    `statut` ENUM('PRESENT', 'ABSENT', 'EN_RETARD', 'MOTIVE') NOT NULL,
    `utilisateurId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,

    INDEX `Presence_serviceId_fkey`(`serviceId`),
    INDEX `Presence_utilisateurId_fkey`(`utilisateurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tti` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `departement` VARCHAR(191) NULL,
    `commune` VARCHAR(191) NULL,
    `sectionCommunale` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NULL,
    `rue` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Church` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL DEFAULT '1',
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `anthem` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `picture` VARCHAR(191) NULL,
    `missionId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `mainPasteur` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `latitude` VARCHAR(191) NULL,
    `longitude` VARCHAR(191) NULL,
    `ttiId` VARCHAR(191) NULL,
    `addressId` VARCHAR(191) NULL,
    `isBaptized` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Church_name_key`(`name`),
    UNIQUE INDEX `Church_addressId_key`(`addressId`),
    INDEX `Church_missionId_fkey`(`missionId`),
    INDEX `Church_ttiId_fkey`(`ttiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NULL,
    `baptismDate` VARCHAR(191) NULL,
    `baptismLocation` VARCHAR(191) NULL,
    `birthCity` VARCHAR(191) NULL,
    `birthCountry` VARCHAR(191) NULL,
    `birthDate` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,
    `churchRole` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `envelopeNumber` VARCHAR(191) NULL,
    `etatCivil` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NOT NULL,
    `instagram` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `profession` VARCHAR(191) NULL,
    `role` ENUM('Admin', 'Membre', 'SuperAdmin', 'Directeur', 'Invite', 'Leader') NOT NULL DEFAULT 'Membre',
    `sex` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `sundayClass` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `membreActif` BOOLEAN NOT NULL DEFAULT true,
    `addressLine` VARCHAR(191) NULL,
    `homePhone` VARCHAR(191) NULL,
    `joinDate` VARCHAR(191) NULL,
    `mobilePhone` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `minister` VARCHAR(191) NULL,
    `plainPassword` VARCHAR(191) NULL,
    `personToContact` VARCHAR(191) NULL,
    `spouseFullName` VARCHAR(191) NULL,
    `latitude` VARCHAR(191) NULL,
    `longitude` VARCHAR(191) NULL,
    `nif` VARCHAR(191) NULL,
    `groupeSanguin` VARCHAR(191) NULL,
    `istimothee` BOOLEAN NULL DEFAULT false,
    `timotheeId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_password_key`(`password`),
    UNIQUE INDEX `User_code_key`(`code`),
    INDEX `User_churchId_fkey`(`churchId`),
    INDEX `User_timotheeId_fkey`(`timotheeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Groupe` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `showToMembers` BOOLEAN NULL,
    `showToNonMembers` BOOLEAN NULL,
    `showMembers` BOOLEAN NULL,
    `showLeaders` BOOLEAN NULL,
    `meetingDays` VARCHAR(191) NULL,
    `meetingTime` VARCHAR(191) NULL,
    `meetingLocation` VARCHAR(191) NULL,
    `meetingFrequency` VARCHAR(191) NULL,
    `maxMembers` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ageGroup` VARCHAR(191) NULL,
    `minister` VARCHAR(191) NULL,

    INDEX `Groupe_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `startDate` VARCHAR(191) NOT NULL,
    `endDate` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT true,
    `endPeriode` VARCHAR(191) NULL,
    `startPeriode` VARCHAR(191) NULL,

    INDEX `Event_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mariage` (
    `id` VARCHAR(191) NOT NULL,
    `brideFullname` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `groomFullname` VARCHAR(191) NOT NULL,
    `goomBirthDate` DATETIME(3) NOT NULL,
    `weddingDate` DATETIME(3) NOT NULL,
    `weddingLocation` VARCHAR(191) NOT NULL,
    `weddingCertificate` VARCHAR(191) NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `brideCertificate` VARCHAR(191) NULL,
    `civilStateOfficer` VARCHAR(191) NULL,
    `grooomCertificate` VARCHAR(191) NULL,
    `witness` VARCHAR(191) NULL,
    `civilStateStateOfficer` VARCHAR(191) NULL,
    `witnessSignature` VARCHAR(191) NULL,

    INDEX `Mariage_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Funeral` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `funeralDate` DATETIME(3) NOT NULL,
    `funeralTime` VARCHAR(191) NOT NULL,
    `relationShip` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `deathCertificate` VARCHAR(191) NULL,
    `nextOfKin` VARCHAR(191) NOT NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `funeralLocation` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'en attente',
    `updatedAt` DATETIME(3) NOT NULL,
    `telephone` VARCHAR(191) NULL,

    INDEX `Funeral_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presentation` (
    `id` VARCHAR(191) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `birthCertificate` VARCHAR(191) NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `presentationDate` DATETIME(3) NOT NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,
    `childName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `witness` VARCHAR(191) NOT NULL,

    INDEX `Presentation_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Baptism` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `baptismDate` DATETIME(3) NOT NULL,
    `baptismCertificate` VARCHAR(191) NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `withness` VARCHAR(191) NOT NULL,
    `previousChurch` VARCHAR(191) NOT NULL,
    `testimony` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `conversionDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NULL,
    `baptismLocation` VARCHAR(191) NOT NULL,
    `endDate` VARCHAR(191) NULL,
    `startDate` VARCHAR(191) NULL,

    INDEX `Baptism_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `death` (
    `id` VARCHAR(191) NOT NULL,
    `deathDate` DATETIME(3) NOT NULL,
    `deathPlace` VARCHAR(191) NOT NULL,
    `deathCause` VARCHAR(191) NOT NULL,
    `deathCertificate` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,
    `deathTime` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `location` VARCHAR(191) NOT NULL,
    `officiantName` VARCHAR(191) NOT NULL,
    `relationShip` VARCHAR(191) NOT NULL,
    `serviceDate` DATETIME(3) NOT NULL,
    `nextOfKin` VARCHAR(191) NOT NULL,

    INDEX `death_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sundayClass` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `teacher` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `maxStudents` VARCHAR(191) NOT NULL,
    `ageGroup` VARCHAR(191) NOT NULL,
    `book` VARCHAR(191) NULL,

    INDEX `sundayClass_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense` (
    `id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,

    INDEX `expense_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offering` (
    `id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,

    INDEX `offering_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tithing` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,

    INDEX `tithing_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donation` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,

    INDEX `donation_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moisson` (
    `id` VARCHAR(191) NOT NULL,
    `contributorName` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NULL,
    `churchId` VARCHAR(191) NULL,

    INDEX `moisson_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comitee` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `meetingDay` VARCHAR(191) NOT NULL,
    `meetingTime` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,

    INDEX `comitee_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `visibility` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `appointment_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfert` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fromChurchId` VARCHAR(191) NOT NULL,
    `toChurchId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `transfert_fromChurchId_fkey`(`fromChurchId`),
    INDEX `transfert_toChurchId_fkey`(`toChurchId`),
    INDEX `transfert_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mission` (
    `id` VARCHAR(191) NOT NULL,
    `missionName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `presidentName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sanction` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `startDate` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `endDate` VARCHAR(191) NULL,

    INDEX `sanction_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ministry` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ministry_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pasteur` (
    `id` VARCHAR(191) NOT NULL,
    `pasteurName` VARCHAR(191) NOT NULL,
    `churchId` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,

    INDEX `pasteur_churchId_fkey`(`churchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Departement` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Departement_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commune` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `departementId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Commune_name_key`(`name`),
    INDEX `Commune_departementId_fkey`(`departementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionCommunale` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `communeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SectionCommunale_name_key`(`name`),
    INDEX `SectionCommunale_communeId_fkey`(`communeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ComiteeLeaders` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ComiteeLeaders_AB_unique`(`A`, `B`),
    INDEX `_ComiteeLeaders_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ComiteeMembers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ComiteeMembers_AB_unique`(`A`, `B`),
    INDEX `_ComiteeMembers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserToappointment` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_UserToappointment_AB_unique`(`A`, `B`),
    INDEX `_UserToappointment_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GroupeToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_GroupeToUser_AB_unique`(`A`, `B`),
    INDEX `_GroupeToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presence` ADD CONSTRAINT `Presence_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presence` ADD CONSTRAINT `Presence_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `Mission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Church` ADD CONSTRAINT `Church_ttiId_fkey` FOREIGN KEY (`ttiId`) REFERENCES `Tti`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_timotheeId_fkey` FOREIGN KEY (`timotheeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Groupe` ADD CONSTRAINT `Groupe_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mariage` ADD CONSTRAINT `Mariage_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Funeral` ADD CONSTRAINT `Funeral_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presentation` ADD CONSTRAINT `Presentation_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baptism` ADD CONSTRAINT `Baptism_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `death` ADD CONSTRAINT `death_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sundayClass` ADD CONSTRAINT `sundayClass_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense` ADD CONSTRAINT `expense_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offering` ADD CONSTRAINT `offering_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tithing` ADD CONSTRAINT `tithing_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donation` ADD CONSTRAINT `donation_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moisson` ADD CONSTRAINT `moisson_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comitee` ADD CONSTRAINT `comitee_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointment` ADD CONSTRAINT `appointment_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfert` ADD CONSTRAINT `transfert_fromChurchId_fkey` FOREIGN KEY (`fromChurchId`) REFERENCES `Church`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfert` ADD CONSTRAINT `transfert_toChurchId_fkey` FOREIGN KEY (`toChurchId`) REFERENCES `Church`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfert` ADD CONSTRAINT `transfert_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanction` ADD CONSTRAINT `sanction_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ministry` ADD CONSTRAINT `ministry_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pasteur` ADD CONSTRAINT `pasteur_churchId_fkey` FOREIGN KEY (`churchId`) REFERENCES `Church`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commune` ADD CONSTRAINT `Commune_departementId_fkey` FOREIGN KEY (`departementId`) REFERENCES `Departement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionCommunale` ADD CONSTRAINT `SectionCommunale_communeId_fkey` FOREIGN KEY (`communeId`) REFERENCES `Commune`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeLeaders` ADD CONSTRAINT `_ComiteeLeaders_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeLeaders` ADD CONSTRAINT `_ComiteeLeaders_B_fkey` FOREIGN KEY (`B`) REFERENCES `comitee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeMembers` ADD CONSTRAINT `_ComiteeMembers_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ComiteeMembers` ADD CONSTRAINT `_ComiteeMembers_B_fkey` FOREIGN KEY (`B`) REFERENCES `comitee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserToappointment` ADD CONSTRAINT `_UserToappointment_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserToappointment` ADD CONSTRAINT `_UserToappointment_B_fkey` FOREIGN KEY (`B`) REFERENCES `appointment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupeToUser` ADD CONSTRAINT `_GroupeToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `Groupe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GroupeToUser` ADD CONSTRAINT `_GroupeToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
