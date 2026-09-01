-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `role` ENUM('BUYER', 'SELLER', 'PLATFORM_MANAGER') NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    `statusReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userAgent` VARCHAR(191) NULL,

    UNIQUE INDEX `sessions_tokenHash_key`(`tokenHash`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jurisdictions` (
    `code` VARCHAR(8) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,

    INDEX `jurisdictions_region_idx`(`region`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `licence_categories` (
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `headline` VARCHAR(180) NOT NULL,
    `about` TEXT NOT NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `country` VARCHAR(8) NOT NULL,
    `investorType` ENUM('STRATEGIC', 'PRIVATE_EQUITY', 'VENTURE_CAPITAL', 'FAMILY_OFFICE', 'ANGEL', 'CORPORATE', 'OTHER') NOT NULL,
    `ticketMinEur` DECIMAL(18, 2) NOT NULL,
    `ticketMaxEur` DECIMAL(18, 2) NOT NULL,
    `timeline` ENUM('IMMEDIATE', 'SHORT', 'MEDIUM', 'EXPLORING') NOT NULL DEFAULT 'EXPLORING',
    `wantsOperatingOnly` BOOLEAN NOT NULL DEFAULT false,
    `proofOfFundsReady` BOOLEAN NOT NULL DEFAULT false,
    `investmentThesis` TEXT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `buyer_profiles_userId_key`(`userId`),
    INDEX `buyer_profiles_investorType_idx`(`investorType`),
    INDEX `buyer_profiles_isPublished_idx`(`isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_target_jurisdictions` (
    `buyerProfileId` VARCHAR(191) NOT NULL,
    `jurisdictionCode` VARCHAR(8) NOT NULL,

    INDEX `buyer_target_jurisdictions_jurisdictionCode_idx`(`jurisdictionCode`),
    PRIMARY KEY (`buyerProfileId`, `jurisdictionCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_target_categories` (
    `buyerProfileId` VARCHAR(191) NOT NULL,
    `categoryCode` VARCHAR(32) NOT NULL,

    INDEX `buyer_target_categories_categoryCode_idx`(`categoryCode`),
    PRIMARY KEY (`buyerProfileId`, `categoryCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buyer_target_business_types` (
    `buyerProfileId` VARCHAR(191) NOT NULL,
    `businessType` ENUM('PAYMENT', 'FINTECH', 'CRYPTO', 'BANKING', 'FOREX', 'GAMING', 'OTHER') NOT NULL,

    INDEX `buyer_target_business_types_businessType_idx`(`businessType`),
    PRIMARY KEY (`buyerProfileId`, `businessType`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `headline` VARCHAR(180) NOT NULL,
    `about` TEXT NOT NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `country` VARCHAR(8) NOT NULL,
    `sellerType` ENUM('OWNER', 'BROKER', 'ADVISORY_FIRM') NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seller_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller_jurisdictions` (
    `sellerProfileId` VARCHAR(191) NOT NULL,
    `jurisdictionCode` VARCHAR(8) NOT NULL,

    INDEX `seller_jurisdictions_jurisdictionCode_idx`(`jurisdictionCode`),
    PRIMARY KEY (`sellerProfileId`, `jurisdictionCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assets` (
    `id` VARCHAR(191) NOT NULL,
    `referenceCode` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `summary` VARCHAR(400) NOT NULL,
    `description` TEXT NOT NULL,
    `jurisdictionCode` VARCHAR(8) NOT NULL,
    `categoryCode` VARCHAR(32) NOT NULL,
    `businessType` ENUM('PAYMENT', 'FINTECH', 'CRYPTO', 'BANKING', 'FOREX', 'GAMING', 'OTHER') NOT NULL,
    `askingPriceEur` DECIMAL(18, 2) NULL,
    `revenueEur` DECIMAL(18, 2) NULL,
    `ebitdaEur` DECIMAL(18, 2) NULL,
    `licenceStatus` ENUM('ACTIVE', 'IN_APPLICATION', 'DORMANT') NOT NULL,
    `regulator` VARCHAR(120) NULL,
    `licenceIssuedYear` INTEGER NULL,
    `yearEstablished` INTEGER NULL,
    `employees` INTEGER NULL,
    `activeClients` INTEGER NULL,
    `hasPassporting` BOOLEAN NOT NULL DEFAULT false,
    `reasonForSale` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'UNDER_OFFER', 'SOLD', 'SUSPENDED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `isValidated` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assets_referenceCode_key`(`referenceCode`),
    UNIQUE INDEX `assets_slug_key`(`slug`),
    INDEX `assets_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `assets_jurisdictionCode_idx`(`jurisdictionCode`),
    INDEX `assets_categoryCode_idx`(`categoryCode`),
    INDEX `assets_businessType_idx`(`businessType`),
    INDEX `assets_sellerId_idx`(`sellerId`),
    INDEX `assets_askingPriceEur_idx`(`askingPriceEur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_features` (
    `assetId` VARCHAR(191) NOT NULL,
    `code` ENUM('STAFF', 'OFFICE', 'BANK_ACCOUNTS', 'MULTI_CURRENCY', 'SOFTWARE_PLATFORM', 'PAYMENT_RAILS', 'CLIENT_BASE', 'SECURITY_AUDIT') NOT NULL,

    INDEX `asset_features_code_idx`(`code`),
    PRIMARY KEY (`assetId`, `code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favourites` (
    `userId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favourites_assetId_idx`(`assetId`),
    PRIMARY KEY (`userId`, `assetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(191) NOT NULL,
    `buyerId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NULL,
    `subject` VARCHAR(200) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `conversations_buyerId_lastMessageAt_idx`(`buyerId`, `lastMessageAt`),
    INDEX `conversations_sellerId_lastMessageAt_idx`(`sellerId`, `lastMessageAt`),
    UNIQUE INDEX `conversations_buyerId_sellerId_assetId_key`(`buyerId`, `sellerId`, `assetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,

    INDEX `messages_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_actions` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NOT NULL,
    `type` ENUM('USER_SUSPEND', 'USER_REINSTATE', 'USER_REMOVE', 'ASSET_SUSPEND', 'ASSET_REINSTATE', 'SELLER_VERIFY') NOT NULL,
    `targetUserId` VARCHAR(191) NULL,
    `targetAssetId` VARCHAR(191) NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `moderation_actions_targetUserId_createdAt_idx`(`targetUserId`, `createdAt`),
    INDEX `moderation_actions_targetAssetId_createdAt_idx`(`targetAssetId`, `createdAt`),
    INDEX `moderation_actions_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_profiles` ADD CONSTRAINT `buyer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_target_jurisdictions` ADD CONSTRAINT `buyer_target_jurisdictions_buyerProfileId_fkey` FOREIGN KEY (`buyerProfileId`) REFERENCES `buyer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_target_jurisdictions` ADD CONSTRAINT `buyer_target_jurisdictions_jurisdictionCode_fkey` FOREIGN KEY (`jurisdictionCode`) REFERENCES `jurisdictions`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_target_categories` ADD CONSTRAINT `buyer_target_categories_buyerProfileId_fkey` FOREIGN KEY (`buyerProfileId`) REFERENCES `buyer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_target_categories` ADD CONSTRAINT `buyer_target_categories_categoryCode_fkey` FOREIGN KEY (`categoryCode`) REFERENCES `licence_categories`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buyer_target_business_types` ADD CONSTRAINT `buyer_target_business_types_buyerProfileId_fkey` FOREIGN KEY (`buyerProfileId`) REFERENCES `buyer_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_profiles` ADD CONSTRAINT `seller_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_jurisdictions` ADD CONSTRAINT `seller_jurisdictions_sellerProfileId_fkey` FOREIGN KEY (`sellerProfileId`) REFERENCES `seller_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seller_jurisdictions` ADD CONSTRAINT `seller_jurisdictions_jurisdictionCode_fkey` FOREIGN KEY (`jurisdictionCode`) REFERENCES `jurisdictions`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_jurisdictionCode_fkey` FOREIGN KEY (`jurisdictionCode`) REFERENCES `jurisdictions`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_categoryCode_fkey` FOREIGN KEY (`categoryCode`) REFERENCES `licence_categories`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_features` ADD CONSTRAINT `asset_features_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favourites` ADD CONSTRAINT `favourites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favourites` ADD CONSTRAINT `favourites_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_targetAssetId_fkey` FOREIGN KEY (`targetAssetId`) REFERENCES `assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
