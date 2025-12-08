-- 电商AI工具数据库架构
-- 数据库名称: e-commerce-ai-tool

CREATE DATABASE IF NOT EXISTS `e-commerce-ai-tool` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `e-commerce-ai-tool`;

-- 装饰图生成记录表
CREATE TABLE IF NOT EXISTS `atmosphere_generations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `prompt` TEXT COMMENT 'AI生成的提示词',
  `material_type` VARCHAR(50) COMMENT '素材类型: atmosphere普通装饰/atmosphere_advanced高级定制',
  `title` VARCHAR(255) COMMENT '商品标题',
  `selling_points` TEXT COMMENT '商品卖点',
  `atmosphere_text` TEXT COMMENT '装饰文字内容',
  `atmosphere_image_url` LONGTEXT COMMENT '生成的装饰图(base64)',
  `raw_response` TEXT COMMENT 'AI原始响应',
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_material_type` (`material_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='装饰图生成记录表';
