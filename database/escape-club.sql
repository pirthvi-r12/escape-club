-- =============================================================================
-- Escape Club — MySQL database (schema + destinations)
-- Apply with: npm run db:apply-sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `avatarUrl` VARCHAR(191) NULL,
  `tier` ENUM('EXPLORER', 'VOYAGER', 'OBSIDIAN') NOT NULL DEFAULT 'EXPLORER',
  `homeCity` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key` (`email`),
  INDEX `User_email_idx` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Destination` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `country` VARCHAR(191) NOT NULL,
  `region` VARCHAR(191) NOT NULL,
  `lat` DOUBLE NOT NULL,
  `lng` DOUBLE NOT NULL,
  `heroImage` VARCHAR(191) NOT NULL,
  `tagline` VARCHAR(191) NOT NULL,
  `basePrice` INTEGER NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Destination_slug_key` (`slug`),
  INDEX `Destination_region_idx` (`region`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Trip` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `destinationId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `status` ENUM('DREAMING', 'BOOKED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'BOOKED',
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `miles` INTEGER NOT NULL DEFAULT 0,
  `spend` INTEGER NOT NULL DEFAULT 0,
  `rating` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Trip_userId_status_idx` (`userId`, `status`),
  INDEX `Trip_createdAt_idx` (`createdAt`),
  CONSTRAINT `Trip_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Trip_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Itinerary` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `tripId` VARCHAR(191) NULL,
  `title` VARCHAR(191) NOT NULL,
  `summary` TEXT NOT NULL,
  `days` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Itinerary_tripId_key` (`tripId`),
  CONSTRAINT `Itinerary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Itinerary_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `BookingEvent` (
  `id` VARCHAR(191) NOT NULL,
  `memberName` VARCHAR(191) NOT NULL,
  `memberTier` ENUM('EXPLORER', 'VOYAGER', 'OBSIDIAN') NOT NULL DEFAULT 'EXPLORER',
  `destination` VARCHAR(191) NOT NULL,
  `country` VARCHAR(191) NOT NULL,
  `amount` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `BookingEvent_createdAt_idx` (`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `Destination` (
  `id`, `slug`, `name`, `country`, `region`, `lat`, `lng`, `heroImage`, `tagline`, `basePrice`
) VALUES
  ('dest_zermatt', 'zermatt', 'Zermatt', 'Switzerland', 'Alps', 46.0207, 7.7491, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=82&w=1600', 'Wake above the weather.', 8400),
  ('dest_moraine_lake', 'moraine-lake', 'Moraine Lake', 'Canada', 'Rockies', 51.3217, -116.186, 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=82&w=1600', 'Ten peaks, one mirror.', 6200),
  ('dest_pragser_wildsee', 'pragser-wildsee', 'Pragser Wildsee', 'Italy', 'Dolomites', 46.6947, 12.0847, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=82&w=1600', 'Glacier water, rowed slowly.', 5400),
  ('dest_isle_of_skye', 'isle-of-skye', 'Isle of Skye', 'Scotland', 'Hebrides', 57.4125, -6.193, 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=82&w=1600', 'Weather as a main character.', 4100),
  ('dest_khumbu', 'khumbu', 'Khumbu', 'Nepal', 'Himalaya', 27.9881, 86.925, 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=82&w=1600', 'The long walk upward.', 12800),
  ('dest_annapurna', 'annapurna', 'Annapurna', 'Nepal', 'Himalaya', 28.5961, 83.8203, 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=82&w=1600', 'Moonlight on a sleeping giant.', 9600),
  ('dest_kluane', 'kluane', 'Kluane', 'Canada', 'Yukon', 60.7522, -137.5108, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=82&w=1600', 'Nobody for a hundred miles.', 7300),
  ('dest_valley_of_fire', 'valley-of-fire', 'Valley of Fire', 'United States', 'Mojave', 36.4816, -114.525, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=82&w=1600', 'An empty road and a full tank.', 3900)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `country` = VALUES(`country`),
  `region` = VALUES(`region`),
  `lat` = VALUES(`lat`),
  `lng` = VALUES(`lng`),
  `heroImage` = VALUES(`heroImage`),
  `tagline` = VALUES(`tagline`),
  `basePrice` = VALUES(`basePrice`);
