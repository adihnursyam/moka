CREATE TABLE `mediaFolder` (
	`id` text PRIMARY KEY NOT NULL,
	`parentId` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`ownerUserId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`parentId`) REFERENCES `mediaFolder`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`ownerUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_folder_parent_slug_unique` ON `mediaFolder` (`parentId`,`slug`);--> statement-breakpoint
CREATE INDEX `media_folder_parent_idx` ON `mediaFolder` (`parentId`);--> statement-breakpoint
ALTER TABLE `mediaAsset` ADD `folderId` text REFERENCES mediaFolder(id);--> statement-breakpoint
CREATE INDEX `media_asset_folder_idx` ON `mediaAsset` (`folderId`);