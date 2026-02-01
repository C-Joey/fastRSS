# Vercel 部署指南

## 📋 已完成的配置

### 1. Vercel 配置文件
- ✅ `vercel.json` - Vercel 部署配置
- ✅ `.vercelignore` - 排除不必要的文件
- ✅ `.env` - 环境变量配置

### 2. Serverless API
- ✅ `api/rss-proxy.ts` - RSS 代理 API 函数
- ✅ `api/package.json` - API 依赖配置

### 3. 代码优化
- ✅ 更新 `src/services/rss.service.ts` 使用 API 端点
- ✅ 添加 `src/vite-env.d.ts` 环境变量类型定义
- ✅ 修复所有 TypeScript 错误

## 🚀 部署步骤

### 方法 1: Vercel CLI (推荐)

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
cd /home/cj/文档/program/fastRSS
vercel

# 4. 生产部署
vercel --prod
```

### 方法 2: GitHub + Vercel Dashboard

```bash
# 1. 提交所有更改
git add .
git commit -m "Add Vercel deployment configuration"

# 2. 推送到 GitHub
git remote set-url origin git@github.com:C-Joey/fastRSS.git
git push -u origin main

# 3. 在 Vercel 导入
# - 访问 https://vercel.com
# - 点击 "New Project"
# - 从 GitHub 导入 C-Joey/fastRSS
# - Vercel 会自动检测配置并部署
```

## 🔧 架构变更说明

### 之前的问题
- ❌ `rss-parser` 在浏览器环境有兼容性问题
- ❌ 使用第三方 CORS 代理不稳定
- ❌ 构建时会出现依赖错误

### 现在的解决方案
- ✅ RSS 解析移到 Vercel Serverless Function
- ✅ 自动处理 CORS 问题
- ✅ 客户端代码更轻量
- ✅ 更好的性能和可靠性

## 📝 API 端点

部署后,RSS 代理 API 将在以下端点可用:

```
https://your-domain.vercel.app/api/rss-proxy?url=<RSS_FEED_URL>
```

## ⚠️ 注意事项

1. **首次部署**: Vercel 会自动安装 `api/package.json` 中的依赖
2. **环境变量**: 如需自定义 API 路径,在 Vercel Dashboard 设置 `VITE_API_BASE_URL`
3. **构建时间**: 首次构建可能需要 2-3 分钟
4. **自动部署**: 推送到 GitHub 后会自动触发部署

## 🎉 完成

部署成功后,你的 RSS AI Reader 将可以通过 Vercel 提供的域名访问!
