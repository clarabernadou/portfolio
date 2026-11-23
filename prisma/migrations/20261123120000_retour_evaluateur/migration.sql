-- Retour de l'évaluateur des projets (23 nov. 2026) : 4 colonnes nullables, migration additive uniquement
-- (la base est partagée entre le local et la production). Aucune colonne existante n'est modifiée.
ALTER TABLE `Project` ADD COLUMN `evaluationMois` VARCHAR(40) NULL;
ALTER TABLE `Project` ADD COLUMN `evaluationPointsForts` TEXT NULL;
ALTER TABLE `Project` ADD COLUMN `evaluationAxes` TEXT NULL;
ALTER TABLE `Project` ADD COLUMN `evaluationRemarque` TEXT NULL;
