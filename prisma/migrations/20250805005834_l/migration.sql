/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Commune` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Departement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `SectionCommunale` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Commune_name_key` ON `Commune`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Departement_name_key` ON `Departement`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `SectionCommunale_name_key` ON `SectionCommunale`(`name`);
