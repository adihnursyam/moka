CREATE TABLE `Finalist` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Finalist_name_unique` ON `Finalist` (`name`);--> statement-breakpoint
CREATE TABLE `IncomePerDate` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`semifinalistId` text,
	`finalistId` text,
	`income` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`semifinalistId`) REFERENCES `Semifinalist`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`finalistId`) REFERENCES `Finalist`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Semifinalist` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Semifinalist_name_unique` ON `Semifinalist` (`name`);