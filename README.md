# 电商 AI 内容生成工具

一个基于 Next.js 和火山引擎 AI 的电商营销素材生成工具，支持智能对话、装饰图片生成和产品讲解视频制作。

🌐 **在线体验**：https://e-commerce-ai-tool.vercel.app  
📦 **GitHub 仓库**：https://github.com/niuyiduo/e-commerce-ai-tool

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [部署指南](#部署指南)
- [功能使用说明](#功能使用说明)
- [项目结构](#项目结构)
- [开发指南](#开发指南)

## ✨ 功能特性

### 1️⃣ AI 智能对话与图片生成

- **商品图片上传**：支持点击上传和拖拽上传两种方式
- **多模型智能切换** 🆕：
  - Doubao-1.5-pro-32k - 高性能版本，适合复杂任务
  - Doubao-1.5-pro-4k - 标准版本，快速响应
  - Doubao-lite-32k - 轻量版本，经济实惠
  - Doubao-lite-4k - 基础版本，快速处理
  - **Doubao-vision** - 多模态模型，支持图文理解
  - **Doubao-thinking-vision** - 思维链模型，深度推理能力
  - 统一 API Key 管理多个模型端点
- **AI 智能对话**：基于火山引擎大模型，理解商品图片内容
- **快捷生成**：
  - 生成商品标题
  - 生成商品卖点
  - 生成装饰宣传图（普通/高级定制）

### 📦 装饰宣传图功能

**普通装饰模式**：
- 自动添加促销徽章（新品、热卖、特价）
- 智能添加100+装饰贴纸（星星、闪电、emoji）
- 自动生成价格标签
- 光晕特效
- 🎨 **优化水印显示**：右下角清晰可见的"抖音电商前端训练营"专属水印（24px 字体，0.9 透明度，带阴影效果）

**高级定制模式** 🆕（需 Vision/Thinking 模型）：
- 🤖 **AI 智能分析商品**：自动识别商品名称、产地、卖点、说明
- 📝 **文字装饰框**：根据AI分析结果动态生成装饰框
- 🖼️ **边框风格选择**（仅 Thinking 模型）：
  - **简约边框**：白灰双线，简洁大方
  - **国潮边框**：红金渐变 + 四角菱形装饰
  - **渐变边框**：紫粉蓝渐变 + 发光阴影效果
  - **豪华边框**：三层金色 + 四角宝石装饰
  - 边框宽度 25px，明显视觉区分
- 🔄 **智能反馈优化**：
  - Vision 模型：3次不满意后提示升级到 Thinking
  - Thinking 模型：无限次优化
  - 独立反馈UI（橙色区域）
  - 边框状态智能保留

### 2️⃣ 产品讲解视频生成

- **多图上传**：支持上传 1-5 张图片（点击或拖拽）
- **视频参数配置**：
  - 时长设置：3-10 秒
  - 转场效果：淡入淡出、滑动、无转场
- **字幕功能**：
  - 自动生成默认讲解字幕（100+话术库）
  - 支持自定义每张图片的讲解文案
  - 📝 **优化字幕显示**：14px 适中字体，视频底部 20px 位置，黑色背景白色文字，清晰易读

### 🎭 虚拟形象讲解功能 🆕

**高级 VRM 3D 形象**（推荐）：
- 🎨 Q版3D虚拟人物（基于 Three.js 渲染）
- 💫 **视觉欺骗模拟说话**（静态VRM，通过动画模拟口型）
- ⏱️ **音频长短控制动作**：根据TTS真实时长同步动画
- 🌬️ **自然动画效果**：
  - 呼吸动画（胸部起伏）
  - 眨眼动画（自然眨眼）
  - 左右轻微摆动
  - 前后适度摆动（避免过快）
  - 随风飘动效果
- 👩 目前支持女性形象

**普通 2D 形象**：
- 🖼️ PNG 静态图片展示
- 📝 基础字幕讲解

**语音配音功能** 🎙️：
- 🔥 火山引擎 TTS 语音合成
- 🎵 男声/女声可选（BV001/BV002）
- ⏱️ **真实时长获取**（从API返回，禁止硬编码）
- 🎬 音视频精准同步输出

- **视频预览与下载**：生成后可在线预览并下载 WebM 格式视频

### 3️⃣ 性能优化与用户体验 🆕

**智能超时机制**：
- ⏱️ Thinking 模型：60秒超时
- ⏱️ 普通模型：30秒超时
- 🛡️ AbortController 超时控制
- 💬 友好的超时提示

**Token 优化**：
- 📊 对话历史限制为最近6轮
- 💰 节省 89% token 消耗
- ⚡ 提升响应速度

**防御性检查**：
- ✅ API 响应格式验证
- ✅ extractInfo 参数验证
- ✅ 错误友好提示

**UI/UX 设计**：
- 🎨 **抖音黑色主题**（深色背景，现代化设计）
- ✅ 完整的拖拽上传支持
- ✅ 视觉反馈（拖拽时高亮显示）
- ✅ 移动端响应式适配
- ⌨️ Shift+Enter 换行支持
- 🔄 持续功能提示

### 4️⃣ 自动化部署 CI/CD 🆕

- **GitHub 版本控制**：完整的 Git 工作流
- **Vercel 自动部署**：
  - 提交代码即触发构建
  - 自动执行 npm install & build
  - 自动部署到全球 CDN
  - 1-3 分钟完成部署
- **环境管理**：Production / Preview / Development 环境隔离
- **一键回滚**：支持快速回滚到任意历史版本
- **实时日志**：完整的构建和部署日志

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **UI 样式**：Tailwind CSS（响应式设计，抖音黑色主题）
- **AI 服务**：火山引擎豆包大模型（**6 个模型可选**）
  - 文本模型：Pro-32k/4k, Lite-32k/4k
  - 多模态模型：Vision, Thinking-Vision
- **图像处理**：Canvas API
- **视频生成**：MediaRecorder API
- **3D 渲染** 🆕：Three.js + @pixiv/three-vrm（VRM虚拟形象）
- **音频处理**：Web Audio API + 火山引擎 TTS
- **部署平台**：Vercel (Edge Network)
- **版本控制**：Git + GitHub
- **CI/CD**：GitHub + Vercel 自动化部署

## 🚀 快速开始

### 前置要求

- Node.js 16.8 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**（或进入项目目录）
   ```bash
   cd e:\字节跳动前端\课题作业\e-commerce-ai-tool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   在项目根目录创建 `.env.local` 文件，添加以下内容：
   ```env
   # API 密钥（所有模型共用）
   VOLCENGINE_API_KEY=你的火山引擎API密钥
   
   # 默认端点 ID
   VOLCENGINE_ENDPOINT_ID=你的默认端点ID
   
   # 多模型端点配置（可选）
   VOLCENGINE_ENDPOINT_PRO_32K=你的Pro32K端点ID
   VOLCENGINE_ENDPOINT_PRO_4K=你的Pro4K端点ID
   VOLCENGINE_ENDPOINT_LITE_32K=你的Lite32K端点ID
   VOLCENGINE_ENDPOINT_LITE_4K=你的Lite4K端点ID
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问：[http://localhost:3000](http://localhost:3000)

## 🔑 环境配置

### 获取火山引擎 API 密钥

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 注册并登录账号
3. 进入"豆包大模型"服务
4. 创建 API 密钥（API Key）
5. 获取端点 ID（Endpoint ID）
6. 将密钥信息填入 `.env.local` 文件

### 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `VOLCENGINE_API_KEY` | 火山引擎 API 访问密钥（所有模型共用） | ✅ |
| `VOLCENGINE_ENDPOINT_ID` | 默认模型端点 ID | ✅ |
| `VOLCENGINE_ENDPOINT_PRO_32K` | Doubao-1.5-pro-32k 端点 ID | ⭕ |
| `VOLCENGINE_ENDPOINT_PRO_4K` | Doubao-1.5-pro-4k 端点 ID | ⭕ |
| `VOLCENGINE_ENDPOINT_LITE_32K` | Doubao-lite-32k 端点 ID | ⭕ |
| `VOLCENGINE_ENDPOINT_LITE_4K` | Doubao-lite-4k 端点 ID | ⭕ |

**注意**：如果不配置多模型端点，系统会使用默认端点 ID。

## 🚀 部署指南

### 方式一：Vercel 自动部署（推荐）

#### 1. 推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "feat: 电商AI工具完整版"

# 推送到 GitHub
git remote add origin https://github.com/niuyiduo/e-commerce-ai-tool.git
git push -u origin main
```

#### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 **Import Project**
4. 选择 `e-commerce-ai-tool` 仓库
5. Vercel 自动识别 Next.js 项目

#### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量：
- `VOLCENGINE_API_KEY`
- `VOLCENGINE_ENDPOINT_ID`
- `VOLCENGINE_ENDPOINT_PRO_32K`（可选）
- `VOLCENGINE_ENDPOINT_PRO_4K`（可选）
- `VOLCENGINE_ENDPOINT_LITE_32K`（可选）
- `VOLCENGINE_ENDPOINT_LITE_4K`（可选）

确保勾选 **Production**、**Preview**、**Development** 三个环境。

#### 4. 部署

点击 **Deploy**，等待 2-3 分钟即可完成部署。

#### 5. CI/CD 自动化

部署成功后，每次推送代码到 GitHub：
```bash
git add .
git commit -m "更新说明"
git push origin main
```

Vercel 会自动：
1. 检测代码更新
2. 自动构建项目
3. 自动部署到生产环境
4. 更新线上应用

**全程自动化，无需手动操作！**

### 方式二：本地部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 📖 功能使用说明

### AI 图片生成模式

1. **上传商品图片**
   - 方式 1：点击虚线框区域，选择图片文件
   - 方式 2：直接拖拽图片到虚线框区域

2. **选择 AI 模型** 🆕
   - 在"AI 模型选择"区域选择合适的模型
   - Doubao-1.5-pro-32k：适合复杂商品描述
   - Doubao-1.5-pro-4k：适合常规文案生成
   - Doubao-lite-32k：适合简单标题生成
   - Doubao-lite-4k：适合快速测试

3. **与 AI 对话**
   - 在对话框中输入需求（如"生成商品标题"）
   - 或点击快捷按钮快速生成

4. **生成装饰宣传图**
   - 输入"生成装饰宣传图"或点击对应按钮
   - AI 会自动添加多种装饰元素
   - 右下角自动添加"抖音电商前端训练营"水印（清晰可见）
   - 点击"📥 下载图片"保存到本地

### 视频生成模式

1. **切换到视频模式**
   - 点击顶部"🎬 视频生成"按钮

2. **上传图片**
   - 上传 1-5 张产品图片（点击或拖拽）
   - 可分批次追加上传
   - 点击图片上的 ❌ 可删除

3. **配置视频参数**
   - 调整视频时长（3-10 秒）
   - 选择转场效果

4. **设置字幕**
   - 默认：自动生成讲解字幕
   - 自定义：为每张图片输入专属文案

5. **生成与下载**
   - 点击"🎬 生成视频"
   - 等待生成完成（通常 5-15 秒）
   - 在线预览后点击"📥 下载视频"

## 📁 项目结构

```
e-commerce-ai-tool/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/chat/
│   │   │   └── route.ts          # AI 对话接口
│   │   ├── globals.css           # 全局样式
│   │   ├── layout.tsx            # 根布局
│   │   └── page.tsx              # 主页面（核心交互）
│   ├── lib/                      # 工具库
│   │   ├── ai/
│   │   │   └── volcengine.ts     # 火山引擎 AI 调用
│   │   ├── canvas/
│   │   │   └── imageGenerator.ts # 图片生成与装饰
│   │   └── video/
│   │       └── videoGenerator.ts # 视频生成
│   └── types/
│       └── global.d.ts           # TypeScript 类型定义
├── .env.local                    # 环境变量（需自行创建）
├── next.config.js                # Next.js 配置
├── package.json                  # 项目依赖
├── tailwind.config.js            # Tailwind CSS 配置
└── tsconfig.json                 # TypeScript 配置
```

## 📅 开发排期

### 项目时间线

| 阶段 | 时间 | 主要任务 | 产出 |
|------|------|---------|------|
| **Week 1** | 第1周 | 需求分析与技术选型 | 技术方案文档 |
| | | - 分析电商素材生成需求 | |
| | | - 选定 Next.js + TypeScript 技术栈 | |
| | | - 确定火山引擎 AI 服务 | |
| **Week 2** | 第2周 | 项目初始化与基础搭建 | 项目框架 |
| | | - 初始化 Next.js 项目 | |
| | | - 配置 Tailwind CSS | |
| | | - 搭建基础 UI 框架 | |
| | | - 实现图片上传功能（点击+拖拽） | |
| **Week 3** | 第3周 | AI 对话功能开发 | AI 对话模块 |
| | | - 集成火山引擎 API | |
| | | - 实现 /api/chat 路由 | |
| | | - 开发对话界面 | |
| | | - 实现商品文案生成 | |
| **Week 4** | 第4周 | 图片装饰功能开发 | 图片处理模块 |
| | | - 开发 Canvas 图片处理 | |
| | | - 实现普通装饰模式（徽章+贴纸） | |
| | | - 添加水印功能 | |
| | | - 实现图片下载 | |
| **Week 5** | 第5周 | 视频生成功能开发 | 视频生成模块 |
| | | - 实现多图上传管理 | |
| | | - 开发 MediaRecorder 视频录制 | |
| | | - 实现转场效果 | |
| | | - 添加字幕功能 | |
| **Week 6** | 第6周 | 语音配音功能开发 | TTS 语音模块 |
| | | - 集成火山引擎 TTS API | |
| | | - 实现 /api/tts 路由 | |
| | | - 开发音视频同步逻辑 | |
| | | - 实现 Web Audio API 混音 | |
| **Week 7** | 第7周 | 多模型切换与高级功能 | 高级功能模块 |
| | | - 实现 6 个 AI 模型切换 | |
| | | - 开发高级定制装饰图（Vision） | |
| | | - 实现智能反馈优化机制 | |
| | | - 添加边框风格选择 | |
| **Week 8** | 第8周 | 部署上线与优化 | 生产环境 |
| | | - GitHub 仓库配置 | |
| | | - Vercel 部署配置 | |
| | | - CI/CD 流程搭建 | |
| | | - 性能优化与文档编写 | |

### 关键里程碑

- ✅ **Week 3 结束**：完成基础 AI 对话功能
- ✅ **Week 5 结束**：完成图片和视频生成核心功能
- ✅ **Week 7 结束**：完成所有高级功能
- ✅ **Week 8 结束**：项目上线并投入使用

---

## 📡 API 接口文档

### 接口概览

本项目提供 2 个主要 API 接口，均基于 Next.js App Router 实现。

---

### 1. AI 对话接口

**接口地址**：`POST /api/chat`

**功能描述**：接收用户消息和商品图片，调用火山引擎 AI 模型生成回复内容。

**请求头**：
```http
Content-Type: application/json
```

**请求体**：
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant',
    content: string
  }>,
  image?: string,              // Base64 格式图片（可选）
  model?: string,              // AI 模型名称（可选）
  feedback?: string,           // 用户反馈（可选）
  previousAnalysis?: string,   // 上次分析结果（可选）
  borderStyle?: string         // 边框样式（可选）
}
```

**请求示例**：
```json
{
  "messages": [
    {
      "role": "user",
      "content": "生成商品标题"
    }
  ],
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "model": "Doubao-1.5-pro-32k"
}
```

**响应体**：
```typescript
{
  content: string              // AI 生成的回复内容
}
```

**响应示例**：
```json
{
  "content": "【限时特惠】高端商务笔记本电脑 - 轻薄便携 超长续航"
}
```

**状态码**：
- `200` - 请求成功
- `400` - 请求参数错误
- `500` - 服务器内部错误

**错误响应示例**：
```json
{
  "error": "Missing required messages"
}
```

**支持的模型列表**：
- `Doubao-1.5-pro-32k` - 高性能长文本模型
- `Doubao-1.5-pro-4k` - 标准快速响应模型
- `Doubao-lite-32k` - 轻量经济模型
- `Doubao-lite-4k` - 基础快速模型
- `Doubao-vision` - 多模态图文理解模型
- `Doubao-thinking-vision` - 思维链深度推理模型

**注意事项**：
1. `image` 字段为 Base64 编码的图片数据
2. Vision 模型需要提供 `image` 参数
3. 高级定制模式需使用 Vision 或 Thinking-Vision 模型
4. `feedback` 和 `previousAnalysis` 用于智能反馈优化

---

### 2. 语音合成接口

**接口地址**：`POST /api/tts`

**功能描述**：将文本转换为语音，调用火山引擎 TTS 服务生成音频。

**请求头**：
```http
Content-Type: application/json
```

**请求体**：
```typescript
{
  text: string,                // 要合成的文本内容
  voice?: string               // 音色选择（可选，默认：BV001_streaming）
}
```

**请求示例**：
```json
{
  "text": "欢迎来到我们的店铺，这款产品性价比超高！",
  "voice": "BV002_streaming"
}
```

**响应**：
- **Content-Type**: `audio/mpeg`
- **Body**: 音频流（二进制数据）

**支持的音色**：
- `BV001_streaming` - 通用女声（默认）
- `BV002_streaming` - 通用男声

**状态码**：
- `200` - 请求成功，返回音频流
- `400` - 请求参数错误
- `500` - 服务器内部错误

**错误响应示例**：
```json
{
  "error": "Missing required text"
}
```

**使用示例**：
```typescript
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: '这是一段测试文本',
    voice: 'BV002_streaming'
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

**注意事项**：
1. 文本长度建议不超过 500 字符
2. 返回的音频格式为 MP3
3. 音频采样率：24000Hz
4. 音频比特率：48kbps
5. 支持中文、英文混合文本

---

### 环境变量配置

API 接口依赖以下环境变量（需在 `.env.local` 中配置）：

```env
# AI 服务配置
VOLCENGINE_API_KEY=你的火山引擎API密钥
VOLCENGINE_ENDPOINT_ID=默认端点ID

# 多模型端点（可选）
VOLCENGINE_ENDPOINT_PRO_32K=Pro32K端点ID
VOLCENGINE_ENDPOINT_PRO_4K=Pro4K端点ID
VOLCENGINE_ENDPOINT_LITE_32K=Lite32K端点ID
VOLCENGINE_ENDPOINT_LITE_4K=Lite4K端点ID
VOLCENGINE_ENDPOINT_VISION=Vision端点ID
VOLCENGINE_ENDPOINT_THINKING_VISION=ThinkingVision端点ID

# TTS 服务配置
VOLCENGINE_TTS_APP_ID=TTS应用ID
VOLCENGINE_TTS_TOKEN=TTS访问令牌
```

---

## 🔧 开发指南

### 核心文件说明

#### `src/app/page.tsx`
主页面组件，包含：
- 模式切换（图片生成 / 视频生成）
- 图片上传处理（点击 + 拖拽）
- AI 对话逻辑
- 视频生成流程

#### `src/lib/canvas/imageGenerator.ts`
图片处理核心功能：
- `generateDecorativeImage()` - 装饰图生成
- `addWatermark()` - 水印添加
- 各类装饰元素绘制函数

#### `src/lib/video/videoGenerator.ts`
视频生成核心功能：
- `generateVideo()` - 视频生成主函数
- `generateDefaultCaptions()` - 默认字幕生成
- `drawCaption()` - 字幕绘制

#### `src/app/api/chat/route.ts`
后端 API 路由：
- 处理前端对话请求
- 调用火山引擎 AI 服务
- 返回生成内容

### 本地开发

```bash
# 开发模式（支持热更新）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 浏览器兼容性说明

项目使用了以下现代浏览器特性：
- **Canvas API**：图片处理
- **MediaRecorder API**：视频录制
- **Drag and Drop API**：拖拽上传
- **FileReader API**：文件读取

建议使用最新版本的 Chrome、Edge 或其他基于 Chromium 的浏览器。

### 拖拽功能实现要点

```typescript
// 关键兼容性处理
const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'; // 提高跨浏览器兼容性
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const files = e.dataTransfer?.files; // 使用可选链
  // 处理文件...
};
```

## 🐛 常见问题

### 1. TypeScript 类型错误

**问题**：`类型"JSX.IntrinsicElements"上不存在属性"body"`

**解决**：
```bash
npm install --save-dev @types/react @types/react-dom
```
然后在 VS Code 中执行 `TypeScript: Restart TS Server`

### 2. 拖拽上传不工作

**解决步骤**：
1. 清空浏览器缓存：`Ctrl + Shift + R`
2. 重启开发服务器
3. 确认使用的是 Chromium 内核浏览器

### 3. AI 接口调用失败

**检查**：
- `.env.local` 文件是否正确配置
- API 密钥是否有效
- 网络连接是否正常
- 控制台错误信息

### 4. 视频生成失败

**可能原因**：
- 图片格式不支持（仅支持 PNG、JPG）
- 图片尺寸过大
- 浏览器不支持 MediaRecorder API

## 📝 注意事项

1. **API 额度**：火山引擎有免费额度限制，请合理使用
2. **图片大小**：建议单张图片不超过 10MB
3. **浏览器**：部分功能需要现代浏览器支持
4. **环境变量**：`.env.local` 文件不应提交到版本控制系统

## 🎯 未来计划

- [x] 多模型智能切换（已完成）
- [x] 自动化 CI/CD 部署（已完成）
- [x] 优化水印和字幕显示（已完成）
- [ ] 支持更多图片装饰风格
- [ ] 添加视频滤镜效果
- [ ] 支持音频添加
- [ ] 批量生成功能
- [ ] 更多 AI 模型接入（文心一言、通义千问）
- [ ] 用户系统和历史记录
- [ ] 移动端 App 版本

## 📄 开源协议

本项目为教育学习用途。

---

**作者**：niuyiduo  
**项目**：抖音电商前端训练营课题二  
**创建日期**：2025年11月  
**最后更新**：2025年12月  
**版本**：2.0.0  
**在线地址**：https://e-commerce-ai-tool.vercel.app
