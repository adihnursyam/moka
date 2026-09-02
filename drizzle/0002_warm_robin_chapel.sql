CREATE TABLE `contentDraft` (
	`id` text PRIMARY KEY NOT NULL,
	`resourceType` text NOT NULL,
	`resourceId` text NOT NULL,
	`baseVersion` integer NOT NULL,
	`snapshotJson` text NOT NULL,
	`authorUserId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`authorUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_draft_resource_unique` ON `contentDraft` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE TABLE `contentRevision` (
	`id` text PRIMARY KEY NOT NULL,
	`resourceType` text NOT NULL,
	`resourceId` text NOT NULL,
	`version` integer NOT NULL,
	`snapshotJson` text NOT NULL,
	`authorUserId` text,
	`reason` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`authorUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_revision_unique` ON `contentRevision` (`resourceType`,`resourceId`,`version`);--> statement-breakpoint
CREATE TABLE `edition` (
	`id` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`timezone` text DEFAULT 'Asia/Jakarta' NOT NULL,
	`lifecycle` text DEFAULT 'draft' NOT NULL,
	`startsAt` integer,
	`endsAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `edition_year_unique` ON `edition` (`year`);--> statement-breakpoint
CREATE UNIQUE INDEX `edition_slug_unique` ON `edition` (`slug`);--> statement-breakpoint
CREATE TABLE `mediaAsset` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`providerKey` text,
	`url` text NOT NULL,
	`filename` text NOT NULL,
	`mimeType` text NOT NULL,
	`bytes` integer NOT NULL,
	`alt` text,
	`decorative` integer DEFAULT false NOT NULL,
	`lifecycle` text DEFAULT 'ready' NOT NULL,
	`ownerUserId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`ownerUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_provider_key_unique` ON `mediaAsset` (`provider`,`providerKey`);--> statement-breakpoint
CREATE TABLE `newsArticle` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`body` text,
	`kind` text DEFAULT 'internal' NOT NULL,
	`sourceUrl` text,
	`coverMediaId` text,
	`publishedAt` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`coverMediaId`) REFERENCES `mediaAsset`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsArticle_slug_unique` ON `newsArticle` (`slug`);--> statement-breakpoint
CREATE TABLE `pageSection` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text,
	`pageKey` text NOT NULL,
	`sectionKey` text NOT NULL,
	`title` text,
	`eyebrow` text,
	`body` text,
	`presentationJson` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_section_unique` ON `pageSection` (`editionId`,`pageKey`,`sectionKey`);--> statement-breakpoint
CREATE TABLE `sponsor` (
	`id` text PRIMARY KEY NOT NULL,
	`editionId` text NOT NULL,
	`name` text NOT NULL,
	`tier` text NOT NULL,
	`website` text,
	`logoMediaId` text,
	`displayOrder` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`editionId`) REFERENCES `edition`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`logoMediaId`) REFERENCES `mediaAsset`(`id`) ON UPDATE no action ON DELETE no action
);
