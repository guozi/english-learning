# 英语学习助手网站 - AI集成指南

## 概述

本文档提供了将英语学习助手网站与OpenAI或其他大型语言模型API集成的详细指南。通过AI集成，网站的各项功能将获得智能增强，提供更准确、个性化的英语学习体验。

## 集成架构

项目已添加以下文件以支持AI集成：

- `js/api-config.js` - API配置文件，管理API密钥和设置
- `js/ai-service.js` - AI服务层，提供与AI API的交互功能
- `js/sentence-analysis-ai.js` - 句子分析AI增强版实现

## 安装步骤

1. 确保您已下载项目的所有文件
2. 在`js/api-config.js`文件中配置您的API密钥
3. 在HTML文件中更新JavaScript引用，使用模块化导入

## API配置

### 配置OpenAI API

1. 访问[OpenAI平台](https://platform.openai.com/)并创建账户
2. 生成API密钥
3. 打开`js/api-config.js`文件
4. 在`API_CONFIG.openai.apiKey`字段中填入您的API密钥

```javascript
const API_CONFIG = {
    openai: {
        apiKey: 'your-api-key-here', // 在此处填入您的OpenAI API密钥
        model: 'gpt-3.5-turbo',      // 可根据需要更改模型
        // 其他配置...
    },
    // ...
};
```

### 配置备选API（可选）

如果您希望使用其他AI提供商（如Azure OpenAI或Anthropic Claude），可以配置备选API：

```javascript
alternative: {
    provider: 'azure', // 可选值: 'none', 'azure', 'anthropic', 'other'
    apiKey: 'your-alternative-api-key',
    model: 'your-model-name',
    baseUrl: 'your-api-endpoint',
},
```

### 调整使用限制

为了控制API使用成本，您可以调整以下设置：

```javascript
limits: {
    maxRequestsPerDay: 100, // 每日最大请求数
    tokensPerRequest: 1000,  // 每次请求的最大令牌数
    cooldownPeriod: 1000,    // 请求之间的冷却时间(毫秒)
},
```

## HTML文件更新

为了支持模块化JavaScript导入，需要在HTML文件中更新脚本标签。在每个HTML文件的`</body>`标签前添加：

```html
<!-- 添加加载指示器 -->
<div id="loading-indicator" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-3"></div>
        <p class="text-gray-700 dark:text-gray-300">处理中，请稍候...</p>
    </div>
</div>

<!-- 使用模块化导入 -->
<script type="module" src="js/api-config.js"></script>
<script type="module" src="js/ai-service.js"></script>
<script type="module" src="js/flashcards-ai.js"></script>
```

对于句子分析页面，使用AI增强版脚本：

```html
<script type="module" src="js/sentence-analysis-ai.js"></script>
```

## 功能集成详情

### 闪卡学习

闪卡学习功能已与AI集成，可以自动从文本中提取有价值的单词并生成完整的闪卡数据。

**使用方法**：
1. 在文本框中输入英语文本
2. 点击"提取单词"按钮
3. AI将分析文本并提取重要单词，生成包含音标、定义、词源、例句等信息的闪卡

### 句子分析

句子分析功能已增强，可提供更准确的语法分析和详细解释。

**使用方法**：
1. 在输入框中输入英语句子
2. 点击"分析句子"按钮
3. AI将分析句子结构、从句、时态、句子成分等，并提供详细解释

### 双语阅读

双语阅读功能可以根据主题生成英语阅读材料及中文翻译。

**使用方法**：
1. 选择阅读主题和难度级别
2. 点击"生成阅读材料"按钮
3. AI将生成相关主题的英语文章及中文翻译，并提供重要词汇解释

### 理解测试

理解测试功能可以根据阅读材料自动生成测试题。

**使用方法**：
1. 阅读完文章后，点击"生成测试"按钮
2. AI将根据文章内容生成多选题测试
3. 完成测试后可查看正确答案和解释

### 学习成就

学习成就功能可以根据用户学习数据生成个性化学习报告和建议。

**使用方法**：
1. 在学习成就页面选择报告类型
2. 点击"生成报告"按钮
3. AI将分析学习数据，生成包含优势、弱点、进度评价和建议的报告

## 故障排除

### 常见问题

1. **API请求失败**
   - 检查API密钥是否正确
   - 确认网络连接正常
   - 查看浏览器控制台是否有错误信息

2. **加载时间过长**
   - 可能是API响应延迟，请耐心等待
   - 考虑减小请求的数据量（如减少提取的单词数量）

3. **功能不可用**
   - 确保在`api-config.js`中启用了相应功能
   - 检查是否达到了API使用限制

## 高级配置

### 自定义提示词

您可以在`ai-service.js`文件中修改发送给AI的提示词，以获得更符合您需求的结果。例如，修改单词提取的提示词：

```javascript
async extractWords(text, maxWords) {
    const prompt = `
    请从以下英语文本中提取${maxWords}个值得学习的单词或短语...
    `;
    // ...
}
```

### 本地存储

系统会将一些数据保存在浏览器的本地存储中，以提高性能并减少API调用。如果需要清除这些数据，可以使用以下代码：

```javascript
localStorage.removeItem('flashcards');
```

## 资源与参考

- [OpenAI API文档](https://platform.openai.com/docs/api-reference)
- [Azure OpenAI服务](https://azure.microsoft.com/zh-cn/products/ai-services/openai-service)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

## 注意事项

- API调用会产生费用，请合理设置使用限制
- 确保遵守AI服务提供商的使用条款和政策
- 定期备份重要数据，避免因API变更导致功能失效

---

如有任何问题或建议，请联系项目维护者。