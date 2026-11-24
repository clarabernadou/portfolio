-- Bandeau « en bref » de la fiche projet (24 nov. 2026) : 3 colonnes facultatives, migration additive.
ALTER TABLE `Project` ADD COLUMN `role` VARCHAR(80) NULL;
ALTER TABLE `Project` ADD COLUMN `equipe` VARCHAR(80) NULL;
ALTER TABLE `Project` ADD COLUMN `duree` VARCHAR(40) NULL;
