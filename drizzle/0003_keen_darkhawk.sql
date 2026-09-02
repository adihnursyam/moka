CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`code` text NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_edition_code_unique` ON `category` (`editionId`,`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_edition_slug_unique` ON `category` (`editionId`,`slug`);--> statement-breakpoint
CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`heroMediaId` text,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`heroMediaId`) REFERENCES `mediaAsset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_edition_slug_unique` ON `event` (`editionId`,`slug`);--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text,
	`ownerType` text NOT NULL,
	`ownerId` text NOT NULL,
	`title` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `galleryItem` (
	`id` text PRIMARY KEY NOT NULL,
	`galleryId` text NOT NULL,
	`mediaId` text,
	`youtubeId` text,
	`caption` text,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`galleryId`) REFERENCES `gallery`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mediaId`) REFERENCES `mediaAsset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizationAssignment` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text,
	`personId` text NOT NULL,
	`title` text NOT NULL,
	`group` text NOT NULL,
	`termLabel` text,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`personId`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `participantAchievement` (
	`id` text PRIMARY KEY NOT NULL,
	`participantId` text NOT NULL,
	`text` text NOT NULL,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`participantId`) REFERENCES `participant`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `participant` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`categoryId` text NOT NULL,
	`stage` text NOT NULL,
	`number` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`bio` text,
	`portraitMediaId` text,
	`paymentUrl` text,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`portraitMediaId`) REFERENCES `mediaAsset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participant_edition_stage_slug_unique` ON `participant` (`editionId`,`stage`,`slug`);--> statement-breakpoint
CREATE TABLE `person` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`shortBio` text,
	`portraitMediaId` text,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`portraitMediaId`) REFERENCES `mediaAsset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `person_slug_unique` ON `person` (`slug`);--> statement-breakpoint
CREATE TABLE `voteDailyTally` (
	`id` text PRIMARY KEY NOT NULL,
	`campaignId` text NOT NULL,
	`participantId` text NOT NULL,
	`localDate` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`campaignId`) REFERENCES `votingCampaign`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participantId`) REFERENCES `participant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vote_tally_unique` ON `voteDailyTally` (`campaignId`,`participantId`,`localDate`);--> statement-breakpoint
CREATE TABLE `votingCampaign` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL,
	`startsAt` integer NOT NULL,
	`endsAt` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`pricePerPoint` integer DEFAULT 0 NOT NULL,
	`resultVisibility` text DEFAULT 'hidden' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votingCampaign_slug_unique` ON `votingCampaign` (`slug`);