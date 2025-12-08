# 数据库本地持久化存储说明

## 概述

本项目实现了基于 **MySQL** 的本地持久化存储功能，用于保存装饰图生成记录，满足课题要求。

---

## 数据库配置

### 连接信息

```
数据库类型: MySQL
数据库名称: e-commerce-ai-tool
主机地址: localhost
端口: 3306
用户名: root
密码: nyd666
```

### 环境变量配置

在项目根目录的 `.env.local` 文件中已配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=nyd666
DB_NAME=e-commerce-ai-tool
```

---

## 数据表结构

### 表名: `atmosphere_generations`

用于存储装饰图生成记录（普通装饰图和高级装饰图）。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | INT AUTO_INCREMENT | 主键，自增ID |
| `created_at` | TIMESTAMP | 创建时间，默认当前时间 |
| `prompt` | TEXT | AI生成提示词 |
| `material_type` | VARCHAR(50) | 素材类型：`atmosphere`(普通装饰) / `atmosphere_advanced`(高级定制) |
| `title` | VARCHAR(255) | 商品标题 |
| `selling_points` | TEXT | 商品卖点 |
| `atmosphere_text` | TEXT | 装饰文字内容/AI分析结果 |
| `atmosphere_image_url` | LONGTEXT | 生成的装饰图(base64格式) |
| `raw_response` | TEXT | AI原始响应 |

---

## 初始化数据库

### 方法 1：使用 SQL 文件

```powershell
# 在项目根目录执行
mysql -u root -pnyd666 < database/schema.sql
```

### 方法 2：手动创建

```powershell
# 1. 连接到 MySQL
mysql -u root -pnyd666

# 2. 执行 SQL 语句
CREATE DATABASE IF NOT EXISTS `e-commerce-ai-tool` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `e-commerce-ai-tool`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# 3. 退出
exit;
```

---

## 数据存储说明

### 普通装饰图 (`material_type = 'atmosphere'`)

**生成内容**：
- 促销徽章（新品/热卖/特价）
- 100+种装饰贴纸（星星、闪电、emoji等）
- 价格标签
- 四角边框装饰
- 光效

**存储时机**：用户生成普通装饰图后自动保存

**存储内容示例**：
```json
{
  "prompt": "生成普通装饰宣传图",
  "material_type": "atmosphere",
  "title": "商品宣传",
  "selling_points": "促销徽章、装饰贴纸、价格标签",
  "atmosphere_text": "普通装饰模式：促销徽章 + 100+种贴纸 + 价格标签 + 四角边框 + 光效",
  "atmosphere_image_url": "data:image/png;base64,iVBORw0KGgo...",
  "raw_response": "普通装饰图生成"
}
```

### 高级装饰图 (`material_type = 'atmosphere_advanced'`)

**生成内容**：
- AI智能分析商品（商品名、产地、卖点、说明）
- 文字装饰框（左侧竖排商品名、产地标签、卖点标签、右下角说明）
- 少量精致贴纸
- 可选边框（简约/国潮/渐变/豪华）

**存储时机**：
1. **无边框版本**：AI分析完成后立即保存
2. **有边框版本**：用户选择边框后保存

**存储内容示例**：
```json
{
  "prompt": "生成高级定制装饰图（豪华边框）",
  "material_type": "atmosphere_advanced",
  "title": "优质商品",
  "selling_points": "多色可选、尺码齐全",
  "atmosphere_text": "AI分析: 优质商品 + 精选供应 + 多色可选 + 豪华边框",
  "atmosphere_image_url": "data:image/png;base64,iVBORw0KGgo...",
  "raw_response": "AI生成：这是一款精选好物，品质保障..."
}
```

---

## API 接口

### 保存记录

**接口**: `POST /api/logs`

**请求示例**:
```javascript
fetch('/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '生成普通装饰宣传图',
    material_type: 'atmosphere',
    title: '商品宣传',
    selling_points: '促销徽章、装饰贴纸',
    atmosphere_text: '普通装饰模式...',
    atmosphere_image_url: 'data:image/png;base64,...',
    raw_response: '普通装饰图生成'
  })
})
```

**响应示例**:
```json
{
  "success": true,
  "message": "记录保存成功",
  "data": {...}
}
```

### 查询记录

**接口**: `GET /api/logs?type=atmosphere&limit=10`

**查询参数**:
- `type`: 类型过滤（`atmosphere` 或 `atmosphere_advanced`）
- `limit`: 返回记录数量（默认10条）

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "created_at": "2025-12-08 22:00:00",
      "material_type": "atmosphere",
      "title": "商品宣传",
      ...
    }
  ]
}
```

---

## 控制台日志

### 保存成功

```
========== 开始保存生成记录 ==========
素材类型: atmosphere_advanced
商品标题: 优质商品
商品卖点: 多色可选
装饰文字: AI分析: 精选供应 + 豪华边框
✅ 记录保存成功！
保存结果: { insertId: 1, affectedRows: 1 }
========================================
```

### 保存失败

```
========== 保存记录失败 ==========
❌ 错误信息: Connection refused
错误详情: Error: connect ECONNREFUSED
====================================
```

---

## 数据查询命令

### 查看所有记录

```powershell
mysql -u root -pnyd666 -D e-commerce-ai-tool -e "SELECT id, material_type, title, created_at FROM atmosphere_generations ORDER BY created_at DESC LIMIT 10;"
```

### 查看普通装饰图

```powershell
mysql -u root -pnyd666 -D e-commerce-ai-tool -e "SELECT * FROM atmosphere_generations WHERE material_type = 'atmosphere';"
```

### 查看高级装饰图

```powershell
mysql -u root -pnyd666 -D e-commerce-ai-tool -e "SELECT * FROM atmosphere_generations WHERE material_type = 'atmosphere_advanced';"
```

### 统计记录数

```powershell
mysql -u root -pnyd666 -D e-commerce-ai-tool -e "SELECT material_type, COUNT(*) as count FROM atmosphere_generations GROUP BY material_type;"
```

---

## 测试步骤

### 1. 初始化数据库

```powershell
mysql -u root -pnyd666 < database/schema.sql
```

### 2. 启动项目

```powershell
npm run dev
```

### 3. 生成装饰图

- 访问 `http://localhost:3000`
- 上传商品图片
- 生成普通装饰图或高级装饰图

### 4. 验证存储

```powershell
# 查看最新记录
mysql -u root -pnyd666 -D e-commerce-ai-tool -e "SELECT * FROM atmosphere_generations ORDER BY created_at DESC LIMIT 1;"
```

---

## 注意事项

1. **数据库连接**：确保 MySQL 服务已启动
2. **环境变量**：`.env.local` 中的数据库配置必须正确
3. **存储容量**：`atmosphere_image_url` 字段使用 LONGTEXT，支持大图片存储
4. **字符编码**：使用 utf8mb4，支持中文和 emoji
5. **索引优化**：已在 `created_at` 和 `material_type` 字段创建索引，提升查询性能

---

## 技术实现

### 数据库连接层

**文件**: `src/lib/db.ts`

使用 `mysql2/promise` 连接池实现：
- 连接池大小：10
- 自动重连
- 参数化查询，防止 SQL 注入

### API 路由

**文件**: `src/app/api/logs/route.ts`

- POST 方法：保存记录
- GET 方法：查询记录
- 完整的错误处理和日志输出

### 前端调用

**文件**: `src/app/page.tsx`

在装饰图生成完成后自动调用 `/api/logs` 保存：
- 普通装饰图：`handleNormalDecorative()` 函数
- 高级装饰图（无边框）：`handleAdvancedDecorative()` 函数
- 高级装饰图（有边框）：`handleAddBorder()` 函数

---

## 课题要求说明

✅ **本地持久化存储**：已实现  
✅ **MySQL 数据库**：已配置并测试通过  
✅ **数据完整性**：保存完整的生成记录和图片  
✅ **查询功能**：支持按类型和时间查询  
✅ **控制台日志**：完整的成功/失败提示  

---

**最后更新**: 2025-12-08  
**版本**: 1.0.0
