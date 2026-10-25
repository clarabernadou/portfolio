-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(120) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(200) NOT NULL,
    `date` VARCHAR(80) NOT NULL,
    `type` VARCHAR(80) NOT NULL,
    `types` JSON NOT NULL,
    `parcours` VARCHAR(120) NOT NULL,
    `line` VARCHAR(400) NOT NULL,
    `tags` JSON NOT NULL,
    `pdf` VARCHAR(400) NULL,
    `docs` JSON NOT NULL,
    `steps` JSON NOT NULL,
    `videos` JSON NULL,
    `github` VARCHAR(400) NULL,
    `figma` VARCHAR(400) NULL,
    `context` TEXT NOT NULL,
    `skillsValidated` JSON NOT NULL,
    `onHome` BOOLEAN NOT NULL DEFAULT false,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(20) NOT NULL DEFAULT 'published',
    `origin` VARCHAR(20) NOT NULL DEFAULT 'manual',
    `fieldMeta` JSON NULL,
    `i18n` JSON NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Project_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Category_kind_name_key`(`kind`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Formation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL DEFAULT 0,
    `intitule` VARCHAR(200) NOT NULL,
    `url` VARCHAR(400) NULL,
    `annees` VARCHAR(40) NOT NULL,
    `diplome` VARCHAR(80) NOT NULL,
    `niveauComplet` VARCHAR(300) NOT NULL,
    `mode` VARCHAR(40) NOT NULL,
    `statut` VARCHAR(40) NOT NULL,
    `projets` VARCHAR(120) NOT NULL,
    `competencesAcquises` JSON NULL,
    `mentionComplementaire` TEXT NULL,
    `origin` VARCHAR(20) NOT NULL DEFAULT 'manual',
    `fieldMeta` JSON NULL,
    `i18n` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL DEFAULT 0,
    `poste` VARCHAR(200) NOT NULL,
    `entreprise` VARCHAR(200) NOT NULL,
    `entrepriseParent` VARCHAR(200) NULL,
    `entrepriseHref` VARCHAR(400) NULL,
    `entrepriseParentHref` VARCHAR(400) NULL,
    `periode` VARCHAR(80) NOT NULL,
    `lieuMode` VARCHAR(300) NOT NULL,
    `contexteEssentiel` TEXT NOT NULL,
    `contexteComplet` TEXT NOT NULL,
    `blocs` JSON NOT NULL,
    `competencesAcquisesComplet` JSON NULL,
    `note` TEXT NULL,
    `origin` VARCHAR(20) NOT NULL DEFAULT 'manual',
    `fieldMeta` JSON NULL,
    `i18n` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkillGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `items` JSON NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `SkillGroup_version_name_key`(`version`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recommendation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL DEFAULT 0,
    `auteur` VARCHAR(120) NOT NULL,
    `initiales` VARCHAR(8) NOT NULL,
    `linkedin` VARCHAR(400) NULL,
    `poste` VARCHAR(200) NOT NULL,
    `relation` VARCHAR(200) NOT NULL,
    `citationCourte` TEXT NOT NULL,
    `texteIntegral` JSON NOT NULL,
    `lettrePdf` VARCHAR(400) NULL,
    `entrepriseHref` VARCHAR(400) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Singleton` (
    `key` VARCHAR(40) NOT NULL,
    `data` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CvOrientation` (
    `id` VARCHAR(10) NOT NULL,
    `data` JSON NOT NULL,
    `generatedAt` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SyncLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` VARCHAR(20) NOT NULL,
    `entity` VARCHAR(40) NOT NULL,
    `entityId` VARCHAR(120) NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `state` VARCHAR(40) NOT NULL,
    `message` TEXT NULL,

    INDEX `SyncLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GeneratedFile` (
    `name` VARCHAR(120) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `lang` VARCHAR(5) NOT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

