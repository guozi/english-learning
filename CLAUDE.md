# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

英语学习助手 — 一个纯前端英语学习工具，通过 LLM API（当前使用 DeepSeek）提供智能化学习体验。包含闪卡学习、句子分析、双语阅读、理解测试、学习成就五大功能模块。

## Tech Stack

- 纯 HTML5 + CSS3 + Vanilla JavaScript (ES6 Modules)
- Tailwind CSS (CDN) + Font Awesome 6.4.0 + Google Fonts
- 零依赖，无构建工具，无 package.json

## Running the Project

```bash
# 任意静态服务器即可，例如：
python3 -m http.server 8080
# 或
npx serve .
```

直接浏览器打开 HTML 文件也可运行，但 ES6 模块需要 HTTP 服务器环境。

## Architecture

### 双版本模式

每个功能模块都有基础版和 AI 增强版：
- `js/flashcards.js` (基础) ↔ `js/flashcards-ai.js` (AI 增强)
- `js/sentence-analysis.js` ↔ `js/sentence-analysis-ai.js`
- `js/reading.js` ↔ `js/reading-ai.js`
- `js/quiz.js` ↔ `js/quiz-ai.js`
- `js/achievements.js` ↔ `js/achievements-ai.js`

HTML 页面通过 `<script type="module">` 引入对应版本。

### 核心数据流

```
HTML 页面 → 功能模块 (*-ai.js) → ai-service.js → api-config.js → DeepSeek API
```

- `js/api-config.js` — API 密钥、模型、限流配置（多提供商支持：OpenAI/DeepSeek/Azure/Anthropic）
- `js/ai-service.js` — 统一 AI 服务类，封装所有 LLM 调用，包含 6 个核心方法：`extractWords`、`analyzeSentence`、`generateReadingContent`、`generateReadingQuestions`、`generateVocabularyQuestions`、`generateLearningReport`

### 状态管理

- `localStorage` — 持久化数据（闪卡、阅读历史、测试历史）
- `sessionStorage` — 临时数据（当前阅读内容）
- 组件内全局变量 — UI 状态

### Prompt 工程约定

所有 AI prompts 要求：
- 严格 JSON 格式输出（无 Markdown/HTML 包裹）
- 中文响应
- 结构化数据字段明确

修改 prompt 时需同步更新对应的 JSON 解析逻辑。

## Code Conventions

- 中文界面，HTML `lang="zh-CN"`，UI 文本硬编码中文
- Tailwind 实用类做样式，支持 `dark:` 暗色模式
- DOM 操作直接使用原生 API，无框架
- ES6 模块导入导出（`import`/`export default`）
