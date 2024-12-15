

CREATE DATABASE IF NOT EXISTS `personalizetest`
USE `personalizetest`;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `code`, `name`) VALUES
	(1, 'cat1', 'category1'),
	(2, 'cat2', 'category2');

CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double DEFAULT NULL,
  `categoryCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_code_key` (`code`),
  KEY `products_categoryCode_fkey` (`categoryCode`),
  CONSTRAINT `products_categoryCode_fkey` FOREIGN KEY (`categoryCode`) REFERENCES `categories` (`code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `code`, `name`, `price`, `categoryCode`) VALUES
	(1, 'prod1', 'produto1', 100, 'cat1'),
	(2, 'prod2', 'produto2', 200, 'cat2'),
	(3, 'prod3', 'produto 3', 300, 'cat2'),
	(5, 'prod4', 'produto4', 400, 'cat1'),
	(7, 'xDPBf', 'produto55', 400, 'cat1');

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `code`, `name`) VALUES
	(1, 'user1', 'user1'),
	(2, 'user2', 'user2');
