// API配置文件 - 用于管理AI API的密钥和设置

const API_CONFIG = {
    // OpenAI API配置
    openai: {
        apiKey: '', // 在此处填入您的OpenAI API密钥
        model: 'gpt-3.5-turbo', // 默认模型
        temperature: 0.8, // 创造性程度 (0-1)
        maxTokens: 1000, // 最大令牌数
        baseUrl: 'https://api.openai.com/v1', // API基础URL
    },
    
    // 备选API配置 (例如: Azure OpenAI, Anthropic Claude等)
    alternative: {
        provider: 'deepseek', // 可选值: 'none', 'azure', 'anthropic', 'other'
        apiKey: 'sk-ed6b5eca33424625828d2a40b56aeb84',
        model: 'deepseek-chat',
        temperature: 0.8, // 创造性程度 (0-1)
        maxTokens: 1000, // 最大令牌数
        baseUrl: 'https://api.deepseek.com/v1',
    },
    
    // API使用限制设置
    limits: {
        maxRequestsPerDay: 100, // 每日最大请求数
        tokensPerRequest: 1000, // 每次请求的最大令牌数
        cooldownPeriod: 1000, // 请求之间的冷却时间(毫秒)
    },
    
    // 功能特定设置
    features: {
        flashcards: {
            enabled: true,
            maxWords: 10, // 每次提取的最大单词数
            maxTokens: 1000, // 生成闪卡的最大令牌数
        },
        sentenceAnalysis: {
            enabled: true,
            maxLength: 200, // 最大句子长度
            maxTokens: 2000, // 生成句子分析的最大令牌数
        },
        reading: {
            enabled: true,
            maxLength: 1000, // 最大文本长度
            maxTokens: 2000, // 生成阅读内容的最大令牌数
            topicCount: 10, // 主题数量
        },
        quiz: {
            enabled: true,
            questionsPerTest: 10, // 每次测试的问题数
            maxTokens: 1500, // 生成测试题的最大令牌数
        },
        achievements: {
            enabled: true,
            maxTokens: 1500, // 生成学习报告的最大令牌数
            reportTypes: ['weekly', 'monthly', 'term'], // 支持的报告类型
        }
    }
};

// 检查API配置是否有效
function validateApiConfig() {
    // 检查主要API配置
    if (!API_CONFIG.openai.apiKey && API_CONFIG.alternative.provider === 'none') {
        console.warn('警告: 未配置任何API密钥，AI功能将不可用');
        return false;
    }
    return true;
}

// 获取当前活跃的API配置
function getActiveApiConfig() {
    if (API_CONFIG.openai.apiKey) {
        return API_CONFIG.openai;
    } else if (API_CONFIG.alternative.provider !== 'none') {
        return API_CONFIG.alternative;
    }
    return null;
}

// 检查是否达到API使用限制
function checkApiLimits() {
    // 这里应该实现实际的限制检查逻辑
    // 例如，从localStorage读取今日使用次数等
    return {
        canMakeRequest: true,
        remainingRequests: API_CONFIG.limits.maxRequestsPerDay,
        message: ''
    };
}

// 导出API配置和相关函数
export { API_CONFIG, validateApiConfig, getActiveApiConfig, checkApiLimits };