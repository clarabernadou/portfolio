-- CreateTable
CREATE TABLE `Asset` (
    `key` VARCHAR(40) NOT NULL,
    `mime` VARCHAR(40) NOT NULL,
    `data` MEDIUMBLOB NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
