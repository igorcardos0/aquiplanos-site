-- ============================================
-- ESTRUTURA DO BANCO DE DADOS - TRACKING SYSTEM
-- ============================================

-- Tabela de eventos
CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(36) PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL,
  `event_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `label` VARCHAR(255) DEFAULT NULL,
  `value` DECIMAL(10,2) DEFAULT NULL,
  `properties` JSON DEFAULT NULL,
  `page_url` TEXT NOT NULL,
  `page_path` VARCHAR(500) DEFAULT NULL,
  `page_title` VARCHAR(255) DEFAULT NULL,
  `referrer` TEXT DEFAULT NULL,
  `session_id` VARCHAR(100) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_event_name` (`event_name`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de API Keys
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `api_key` VARCHAR(100) NOT NULL UNIQUE,
  `domain` VARCHAR(255) DEFAULT NULL COMMENT 'Domínios permitidos separados por vírgula',
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_api_key` (`api_key`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de eventos customizados (opcional)
CREATE TABLE IF NOT EXISTS `custom_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `event_type` VARCHAR(50) DEFAULT 'custom',
  `category` VARCHAR(100) DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Insere API key padrão (GERE UMA NOVA CHAVE SEGURA!)
-- IMPORTANTE: Substitua 'sua-api-key-aqui' por uma chave segura gerada
INSERT INTO `api_keys` (`api_key`, `domain`, `active`) 
VALUES ('sua-api-key-aqui', 'app.aquiplanos.com.br,localhost', 1)
ON DUPLICATE KEY UPDATE `active` = 1;

-- ============================================
-- COMO GERAR UMA API KEY SEGURA
-- ============================================
-- Use este comando PHP para gerar uma chave segura:
-- <?php echo bin2hex(random_bytes(32)); ?>
-- 
-- Ou use este SQL para gerar uma:
-- UPDATE api_keys SET api_key = CONCAT('apk_', SUBSTRING(MD5(RAND()), 1, 32)) WHERE id = 1;

