# English Learning Assistant

基于 LLM 的智能英语学习助手，提供闪卡记忆、句子分析、双语阅读、理解测验、学习成就五大功能模块。

## 功能

- **闪卡学习** — AI 生成单词卡片，支持间隔重复
- **句子分析** — 语法结构拆解、成分标注、中文释义
- **双语阅读** — AI 生成适合你水平的英文文章，附中文对照
- **理解测验** — 基于阅读内容自动出题，检验理解程度
- **学习成就** — 追踪学习进度，生成个性化学习报告

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 19 + TypeScript + Tailwind CSS v4 + Vite |
| 后端 | Express + TypeScript |
| AI | DeepSeek API（可配置其他 OpenAI 兼容接口） |
| 部署 | Vercel（前端静态托管 + Serverless Function） |

## 项目结构

```
├── client/          # React 前端
│   └── src/
│       ├── pages/   # 页面组件
│       ├── components/
│       ├── hooks/
│       └── types/
├── server/          # Express 后端
│   └── src/
│       ├── routes/  # API 路由
│       ├── services/# AI 服务封装
│       └── middleware/
├── api/             # Vercel Serverless 入口
└── vercel.json
```

## 本地开发

### 前置条件

- Node.js >= 18

### 启动

```bash
# 安装依赖
cd server && npm install && cd ../client && npm install && cd ..

# 启动后端（端口 3001）
npm run dev:server

# 另开终端，启动前端（端口 5173）
npm run dev:client
```

前端通过 Vite proxy 将 `/api` 请求转发到后端。

启动后在页面右上角点击设置图标，配置 AI 服务（API Key、Base URL、Model）即可使用全部功能。支持 DeepSeek、OpenAI、Groq、Moonshot 等 OpenAI 兼容接口。

## 部署

项目已适配 Vercel 部署：

1. 在 Vercel 导入项目
2. 部署即可 — 前端静态托管，后端自动转为 Serverless Function
3. 用户在页面上自行配置 AI 服务

## License

MIT
