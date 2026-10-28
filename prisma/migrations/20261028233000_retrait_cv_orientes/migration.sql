-- CV orientés retirés (décision de Clara, 28 oct. 2026) : seul le CV principal reste.
-- Leur contenu est conservé dans la sauvegarde backups/portfolio-2026-10-28-22-34.json.
DELETE FROM `GeneratedFile` WHERE `kind` IN ('ux', 'dev');
DROP TABLE `CvOrientation`;
