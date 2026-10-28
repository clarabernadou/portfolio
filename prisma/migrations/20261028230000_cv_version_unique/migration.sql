-- Le CV n'a plus qu'une version (décision de Clara, 28 oct. 2026) : les champs de la
-- version complète disparaissent. Les textes retirés sont exportés avant (backups/).
ALTER TABLE `Experience` DROP COLUMN `contexteComplet`, DROP COLUMN `competencesAcquisesComplet`;
ALTER TABLE `Formation` DROP COLUMN `competencesAcquises`;
DELETE FROM `SkillGroup` WHERE `version` = 'complet';
