-- DropIndex
DROP INDEX `ActionItem_ownerEmail_idx` ON `actionitem`;

-- AlterTable
ALTER TABLE `actionitem` ADD COLUMN `actionText` LONGTEXT NULL,
    ADD COLUMN `lastReminder` DATETIME(3) NULL,
    ADD COLUMN `reminderSent` INTEGER NOT NULL DEFAULT 0;
