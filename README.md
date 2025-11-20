# 电商 AI 内容生成工具

一个基于 Next.js 和火山引擎 AI 的电商营销素材生成工具，支持智能对话、装饰图片生成和产品讲解视频制作。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [功能使用说明](#功能使用说明)
- [项目结构](#项目结构)
- [开发指南](#开发指南)

## ✨ 功能特性

### 1️⃣ AI 智能对话与图片生成

- **商品图片上传**：支持点击上传和拖拽上传两种方式
- **AI 智能对话**：基于火山引擎大模型，理解商品图片内容
- **快捷生成**：
  - 生成商品标题
  - 生成商品卖点
  - 生成装饰宣传图
- **装饰宣传图功能**：
  - 自动添加促销徽章（新品、热卖）
  - 智能添加装饰贴纸（星星、闪电）
  - 自动生成价格标签
  - 四角装饰边框
  - 光晕特效
  - 自动添加"抖音电商前端训练营"水印

### 2️⃣ 产品讲解视频生成

- **多图上传**：支持上传 1-5 张图片（点击或拖拽）
- **视频参数配置**：
  - 时长设置：3-10 秒
  - 转场效果：淡入淡出、滑动、无转场
- **字幕功能**：
  - 自动生成默认讲解字幕
  - 支持自定义每张图片的讲解文案
  - 字幕自动叠加在视频底部
- **视频预览与下载**：生成后可在线预览并下载

### 3️⃣ 跨浏览器兼容

- ✅ Chrome / Edge / 联想浏览器
- ✅ 完整的拖拽上传支持
- ✅ 视觉反馈（拖拽时高亮显示）

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **UI 样式**：Tailwind CSS
- **AI 服务**：火山引擎豆包大模型
- **图像处理**：Canvas API
- **视频生成**：MediaRecorder API

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
   VOLCENGINE_API_KEY=你的火山引擎API密钥
   VOLCENGINE_ENDPOINT_ID=你的端点ID
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
| `VOLCENGINE_API_KEY` | 火山引擎 API 访问密钥 | ✅ |
| `VOLCENGINE_ENDPOINT_ID` | 火山引擎模型端点 ID | ✅ |

## 📖 功能使用说明

### AI 图片生成模式

1. **上传商品图片**
   - 方式 1：点击虚线框区域，选择图片文件
   - 方式 2：直接拖拽图片到虚线框区域

2. **与 AI 对话**
   - 在对话框中输入需求（如"生成商品标题"）
   - 或点击快捷按钮快速生成

3. **生成装饰宣传图**
   - 输入"生成装饰宣传图"或点击对应按钮
   - AI 会自动添加多种装饰元素
   - 右下角自动添加水印
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

- [ ] 支持更多图片装饰风格
- [ ] 添加视频滤镜效果
- [ ] 支持音频添加
- [ ] 批量生成功能
- [ ] 更多 AI 功能集成

## 📄 开源协议

本项目为教育学习用途。

---

**作者**：抖音电商前端训练营  
**创建日期**：2025年11月  
**版本**：1.0.0
