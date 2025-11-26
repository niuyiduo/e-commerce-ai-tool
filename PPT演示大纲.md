---
marp: true
theme: default
paginate: true
backgroundColor: white
style: |
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
---

# 电商商品素材智能生成工具

PPT 课题二演示

---

# 大致介绍

电商商品素材智能生成工具
基于 Next.js 和火山引擎 AI

汇报人：牛一朵
项目地址：https://e-commerce-ai-tool.vercel.app
汇报时间：2025年12月

---

# 目录

1. 项目背景与痛点
2. 解决方案与核心价值
3. 功能演示
4. 技术架构
5. 部署与 CI/CD
6. 项目亮点

---

# 项目背景

<div class="columns">
<div>

**人工撰写文案**
- 耗时 30 分钟以上
- 需要专业文案能力
- 难以批量生成

**设计师制作图片**
- 耗时 2 小时以上
- 需要设计工具和技能
- 成本高

</div>
<div>

**视频团队拍摄**
- 耗时 1 天以上
- 需要拍摄设备和团队
- 制作周期长

</div>
</div>

---

# 解决方案

<div class="columns">
<div>

**商品文案生成**
- AI 自动生成标题和卖点
- 10 秒左右完成
- 效率提升高

**装饰宣传图生成**
- 自动添加装饰元素和水印
- 40 秒左右完成
- 效率提升

</div>
<div>

**产品讲解视频生成**
- 多图智能合成视频
- 30 秒以内完成
- 效率提升

</div>
</div>

---

# 核心价值

<div class="columns">
<div>

**降低成本**
- 减少文案撰写时间
- 无需专业设计团队
- 无需太多视频制作

**提升效率**
- 秒级生成素材
- 包含批量处理
- 标准化流程

</div>
<div>

**提高转化**
- AI 优化的营销话术
- 专业的视觉效果
- 直观的视频展示

</div>
</div>

---

# AI 图片生成

<div class="columns">
<div>

**上传商品图片**
- 支持拖拽和点击上传
- 实时预览
- 跨浏览器兼容

**多模型智能切换**
- Doubao-1.5-pro-32k
- Doubao-1.5-pro-4k
- Doubao-lite-32k
- Doubao-lite-4k

</div>
<div>

**AI 智能对话**
- 生成商品标题
- 生成商品卖点
- 生成装饰宣传图

**统一 API Key 管理**
- 一个密钥管理多个模型
- 动态端点映射

</div>
</div>

---

# 装饰图生成

<div class="columns">
<div>

**装饰元素**
- 促销徽章（新品、热卖）
- 装饰贴纸（星星、闪电）
- 价格标签
- 四角边框
- 光晕特效

</div>
<div>

**水印功能**
- 抖音电商前端训练营水印
- 右下角位置
- 18px 字体，0.9 透明度
- 带阴影效果，清晰可见

**一键下载**
- 高清 PNG 格式

</div>
</div>

---

# 视频生成

<div class="columns">
<div>

**多图上传**
- 支持 1-5 张图片
- 拖拽或点击上传
- 追加上传功能

**参数配置**
- 时长：3-10 秒可调
- 转场：淡入淡出、滑动、无转场

</div>
<div>

**字幕功能**
- 自动生成默认讲解
- 支持自定义文案
- 14px 字体，底部显示

**视频预览与下载**
- 在线实时预览
- WebM 格式下载

</div>
</div>

---

# 技术架构

<div class="columns">
<div>

**前端框架**
- Next.js 14 App Router
- React 18
- TypeScript

**样式方案**
- Tailwind CSS
- 响应式设计
- 移动端适配

</div>
<div>

**核心技术**
- Canvas API 图片处理
- MediaRecorder API 视频生成
- Drag and Drop API 拖拽上传

**AI 服务**
- 火山引擎豆包大模型
- 原生 Fetch API 调用
- 多端点动态映射

</div>
</div>

---

# 架构图

<div class="columns">
<div>

**用户层**
- 访问 Vercel 部署地址
- 浏览器端交互

**前端应用**
- Next.js 14 App Router
- API 路由处理
- 工具库封装

</div>
<div>

**工具模块**
- imageGenerator 图片生成
- videoGenerator 视频生成
- volcengine AI 调用

**AI 服务**
- 火山引擎豆包
- 4 个模型端点
- 统一 API Key 认证

</div>
</div>

---

# 部署方案

<div class="columns">
<div>

**GitHub 版本控制**
- 代码托管在 GitHub
- 完整的提交历史
- 分支管理

**Vercel 自动部署**
- 提交代码即触发构建
- 自动执行 npm install
- 自动执行 npm run build
- 自动部署到全球 CDN

</div>
<div>

**部署时间**
- 1-3 分钟完成部署
- 实时构建日志
- 自动通知

**环境管理**
- Production 生产环境
- Preview 预览环境
- Development 开发环境

</div>
</div>

---

# CI/CD 流程

<div class="columns">
<div>

**开发阶段**
- 本地修改代码
- git add 和 git commit
- git push 到 GitHub

**自动构建**
- GitHub 触发 Webhook
- Vercel 检测更新
- 自动安装依赖
- 自动构建项目

</div>
<div>

**自动部署**
- 构建成功后自动部署
- 更新到生产环境
- 全球 CDN 分发
- 用户访问新版本

**全程自动化**
- 无需手动操作
- 秒级更新

</div>
</div>

---

# 技术创新

<div class="columns">
<div>

**纯前端视频生成**
- 无需后端视频处理
- Canvas 和 MediaRecorder 结合
- 实时预览
- 性能优化

**多模型智能切换**
- 4 个 AI 模型可选
- 统一 API Key 管理
- 动态端点映射

</div>
<div>

**完整 CI/CD**
- 零配置部署
- 秒级更新
- 全球加速
- 一键回滚

**跨平台兼容**
- 响应式设计
- 移动端适配
- 跨浏览器支持

</div>
</div>

---

# 用户体验

<div class="columns">
<div>

**拖拽上传**
- 直观的交互方式
- 视觉反馈
- 跨浏览器兼容

**快捷操作**
- 常用功能一键触达
- 智能提示
- 实时反馈

</div>
<div>

**高可用性**
- 在线率较高
- 全球 CDN 加速
- 自动故障恢复

**性能优化**
- 首屏秒开
- 按需加载
- 缓存优化

</div>
</div>

---

# 商业价值

<div class="columns">
<div>

**降低成本**
- 人力成本减少
- 无需设计团队
- 无需视频团队

**提升效率**
- 文案生成 10 秒
- 图片生成 40 秒
- 视频生成 30 秒

</div>
<div>

**规模化应用**
- 支持批量处理
- 标准化流程
- 品牌一致性

**提升转化率**
- AI 优化文案
- 专业视觉效果
- 视频展示更直观

</div>
</div>

---

# 数据对比

<div class="columns">
<div>

**撰写文案**
- 传统：30 分钟
- 本项目：10 秒
- 效率提升

**制作宣传图**
- 传统：2 小时
- 本项目：40 秒
- 效率提升

</div>
<div>

**拍摄视频**
- 传统：1 天
- 本项目：30 秒
- 效率提升

</div>
</div>

---

# 功能演示

<div class="columns">
<div>

**演示内容**
1. 上传商品图片（拖拽）
2. 选择 AI 模型
3. 生成商品标题和卖点
4. 生成装饰宣传图

</div>
<div>

**演示内容（续）**
5. 上传多张图片
6. 配置视频参数
7. 生成产品讲解视频
8. 下载生成的素材

**在线体验**
https://e-commerce-ai-tool.vercel.app

</div>
</div>

---

# 未来规划 - 短期优化

<div class="columns">
<div>

**视频功能**
- 支持 MP4、GIF 格式
- 添加视频滤镜效果
- 支持音频添加

**图片功能**
- 图片编辑（裁剪、滤镜）
- 更多装饰风格模板
- 批量图片处理

</div>
<div>

**交互优化**
- 优化移动端体验
- 增强触摸交互
- 更多快捷操作

</div>
</div>

---

# 技术栈总结

<div class="columns">
<div>

**前端技术**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

**核心 API**
- Canvas API
- MediaRecorder API
- Drag and Drop API
- FileReader API

</div>
<div>

**AI 服务**
- 火山引擎豆包
- 4 个模型端点
- 统一 API Key

**部署运维**
- Vercel 平台
- GitHub 版本控制
- 自动化 CI/CD
- 全球 CDN

</div>
</div>

---

# 项目成果

<div class="columns">
<div>

**功能完整性**
- AI 文案生成
- 图片装饰处理
- 视频智能合成
- 多模型切换

**技术先进性**
- 纯前端实现
- 现代化框架
- 自动化部署
- 高性能优化

</div>
<div>

**用户体验**
- 响应式设计
- 拖拽交互
- 实时预览
- 快捷操作

**项目规范**
- 代码规范
- 类型安全
- 文档完善
- 可维护性高

</div>
</div>

---

# 总结

<div class="columns">
<div>

**技术创新**
- 纯前端视频生成
- 多模型智能切换
- 完整 CI/CD 流程

**用户价值**
- 显著降低成本
- 大幅提升效率
- 提高转化率

</div>
<div>

**学习成果**
- Next.js 实战经验
- AI 接口集成能力
- 前端工程化实践
- 自动化部署经验

**实际应用**
- 可直接用于生产环境
- 支持规模化使用
- 具备商业价值

</div>
</div>

---

# Q&A

<div class="columns">
<div>

**常见问题**
1. 如何获取火山引擎 API 密钥？
2. 如何部署到自己的服务器？
3. 如何添加更多 AI 模型？
4. 如何自定义装饰元素？
5. 视频格式兼容性如何？

</div>
<div>

**技术交流**
- GitHub 仓库
  github.com/niuyiduo/e-commerce-ai-tool

- 在线体验
  e-commerce-ai-tool.vercel.app

</div>
</div>

---

# 致谢

<div class="columns">
<div>

**指导老师**
感谢老师的悉心指导

**训练营**
感谢字节跳动前端训练营
提供的学习机会

</div>
<div>

**技术支持**
- 火山引擎 AI 服务
- Vercel 部署平台
- GitHub 代码托管
- Next.js 开源框架

</div>
</div>

---

# 谢谢观看

<div class="columns">
<div>

**项目信息**
- 项目名称
  电商商品素材智能生成工具
- 开发者
  niuyiduo

</div>
<div>

**访问地址**
- 在线体验
  e-commerce-ai-tool.vercel.app
- GitHub 仓库
  github.com/niuyiduo/e-commerce-ai-tool

</div>
</div>

