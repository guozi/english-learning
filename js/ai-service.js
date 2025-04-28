// AI服务层 - 提供与OpenAI或其他大模型API的集成功能

import { API_CONFIG, validateApiConfig, getActiveApiConfig, checkApiLimits } from './api-config.js';

/**
 * AI服务类 - 提供与AI API交互的所有方法
 */
class AIService {
    constructor() {
        this.isConfigValid = validateApiConfig();
        this.apiConfig = getActiveApiConfig();
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }

    /**
     * 发送请求到AI API
     * @param {string} prompt - 提示文本
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} - API响应
     */
    async sendRequest(prompt, options = {}) {
        // 检查API配置是否有效
        if (!this.isConfigValid) {
            throw new Error('API配置无效，请检查API密钥设置');
        }

        // 检查API使用限制
        const limitCheck = checkApiLimits();
        if (!limitCheck.canMakeRequest) {
            throw new Error(`API请求受限: ${limitCheck.message}`);
        }

        // 应用冷却时间
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < API_CONFIG.limits.cooldownPeriod) {
            const waitTime = API_CONFIG.limits.cooldownPeriod - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        try {
            // 准备请求参数
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: options.model || this.apiConfig.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options.temperature || this.apiConfig.temperature,
                    max_tokens: options.maxTokens || this.apiConfig.maxTokens
                })
            };

            // 发送请求
            const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, requestOptions);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
            }

            // 更新请求计数和时间
            this.requestCount++;
            this.lastRequestTime = Date.now();

            // 返回响应数据
            return await response.json();
        } catch (error) {
            console.error('AI API请求错误:', error);
            throw error;
        }
    }

    /**
     * 提取文本中的单词并生成闪卡
     * @param {string} text - 输入文本
     * @param {number} maxWords - 最大单词数
     * @param {string} level - 单词难度级别
     * @returns {Promise<Array>} - 单词数据数组
     */
    async extractWords(text, maxWords = API_CONFIG.features.flashcards.maxWords, level = 'all') {
        // 根据级别设置提示词
        let levelPrompt = '';
        switch(level) {
            case 'cet4':
                levelPrompt = '请提取CET-4以上难度的单词，即大学英语四级以上水平的词汇';
                break;
            case 'cet6':
                levelPrompt = '请提取CET-6以上难度的单词，即大学英语六级以上水平的词汇';
                break;
            case 'advanced':
                levelPrompt = '请提取高级词汇，即专业英语或学术英语中常见的高难度词汇';
                break;
            case 'all':
            default:
                levelPrompt = '请提取各种难度级别的值得学习的单词';
                break;
        }
        
        const prompt = `
        请从以下英语文本中提取${maxWords}个单词或短语，${levelPrompt}，并为每个单词提供以下信息：
        1. 单词本身
        2. 音标
        3. 中文定义
        4. 词源简介
        5. 英语例句
        6. 例句中文翻译

        请严格按照以下JSON格式返回，且包含以下字段，注意：格式为纯文本且无任何标记符号：
        [
          {
            "word": "单词",
            "phonetic": "音标",
            "definition": "定义",
            "etymology": "词源",
            "example": "例句",
            "exampleTranslation": "例句翻译"
          }
        ]

        文本：${text}
        `;

        try {
            const response = await this.sendRequest(prompt);
            const content = response.choices[0].message.content;
            // 解析JSON响应
            return JSON.parse(content);
        } catch (error) {
            console.error('提取单词失败:', error);
            // 返回一些示例数据作为后备
            return [
                {
                    word: 'vocabulary',
                    phonetic: '/vəˈkæbjələri/',
                    definition: 'n. 词汇表；词汇量',
                    etymology: '来自拉丁语 vocabularium，由 vocab(呼唤) + -ary(表名词)',
                    example: 'Reading books is a great way to expand your vocabulary.',
                    exampleTranslation: '阅读书籍是扩大词汇量的好方法。'
                }
            ];
        }
    }

    /**
     * 分析英语句子结构
     * @param {string} sentence - 输入句子
     * @returns {Promise<Object>} - 句子分析结果
     */
    async analyzeSentence(sentence) {
        const prompt = `
        请你作为一位专业的英语语法分析专家，对下面这个英文句子进行全面细致的语法分析。请按照以下六个部分逐一分析，并用中文准确无误的输出结果：
        1. 句子结构（简单句、复合句、复杂句等）
        2. 从句分析（如果有）
        3. 时态分析
        4. 句子成分标注（主语、谓语、宾语、定语、状语、补语、同位语等）
        5. 重要短语解析
        6. 语法要点解释

        请严格按照以下JSON格式返回，且包含以下字段，注意：格式为纯文本且无任何标记符号：
        {
          "structure": {
            "type": "句子类型",
            "explanation": "详细的句子结构解释"
          },
          "clauses": [
            {
              "text": "从句文本",
              "type": "从句类型",
              "function": "在句中的功能"
            }
          ],
          "tense": [{
            "name": "时态名称",
            "explanation": "时态解释"
          }],
          "components": [
            {
              "text": "成分文本",
              "type": "成分类型",
              "explanation": "成分解释"
            }
          ],
          "phrases": [
            {
              "text": "短语文本",
              "type": "短语类型",
              "explanation": "短语解释"
            }
          ],
          "grammarPoints": [
            {
              "point": "语法点",
              "explanation": "语法解释"
            }
          ]
        }

        句子：${sentence}
        `;

        try {
            const response = await this.sendRequest(prompt);
            const content = response.choices[0].message.content;
            // 解析JSON响应
            return JSON.parse(content);
        } catch (error) {
            console.error('句子分析失败:', error);
            // 返回基本分析作为后备
            return {
                structure: {
                    type: '简单句',
                    explanation: '这是一个基本的简单句结构'
                },
                components: [
                    {
                        text: sentence,
                        type: '完整句子',
                        explanation: '无法进行详细分析'
                    }
                ]
            };
        }
    }
    
    /**
     * 生成双语阅读内容
     * @param {string} topic - 阅读主题
     * @param {string} level - 难度级别
     * @returns {Promise<Object>} - 阅读内容对象
     */
    async generateReadingContent(topic, level) {
        const prompt = `
        请根据以下要求生成一篇英语阅读材料：
        主题：${topic}
        难度级别：${level}（初级/中级/高级）
        
        请提供以下内容：
        1. 英语原文（300-500字）
        2. 中文翻译
        3. 10个重要词汇，包含：英文单词、音标、中文释义、例句
        
        请以JSON格式返回，格式为：
        {
          "title": "标题",
          "english": "英语原文...",
          "chinese": "中文翻译...",
          "vocabulary": [
            {
              "word": "单词",
              "phonetic": "音标",
              "meaning": "中文释义",
              "example": "例句"
            },
            ...
          ]
        }
        `;
        
        try {
            const response = await this.sendRequest(prompt, {
                temperature: 0.7,
                maxTokens: API_CONFIG.features.reading.maxTokens || 2000
            });
            
            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('生成阅读内容失败:', error);
            throw new Error('无法生成阅读内容，请稍后再试');
        }
    }

    /**
     * 生成阅读理解测试题
     * @param {Object} reading - 阅读内容
     * @param {number} questionCount - 问题数量
     * @returns {Promise<Array>} - 问题数组
     */
    async generateReadingQuestions(reading, questionCount = 5) {
        const prompt = `
        请根据以下英语阅读材料，生成${questionCount}道多选题测试阅读理解：
        
        标题：${reading.title}
        内容：${reading.english}
        
        请生成${questionCount}道多选题，每题4个选项，只有1个正确答案。
        每道题目应包含：问题、4个选项、正确答案索引（0-3）、解释。
        
        请以JSON格式返回，格式为：
        [
          {
            "question": "问题内容",
            "options": ["选项A", "选项B", "选项C", "选项D"],
            "correctIndex": 0,
            "explanation": "为什么这是正确答案的解释"
          },
          ...
        ]
        `;
        
        try {
            const response = await this.sendRequest(prompt, {
                temperature: 0.7,
                maxTokens: API_CONFIG.features.quiz.maxTokens || 1500
            });
            
            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('生成阅读理解题失败:', error);
            throw new Error('无法生成阅读理解题，请稍后再试');
        }
    }

    /**
     * 生成词汇测试题
     * @param {Array} vocabulary - 词汇列表
     * @param {number} questionCount - 问题数量
     * @returns {Promise<Array>} - 问题数组
     */
    async generateVocabularyQuestions(vocabulary, questionCount = 5) {
        const prompt = `
        请根据以下词汇列表，生成${questionCount}道多选题测试词汇掌握程度：
        
        ${JSON.stringify(vocabulary)}
        
        请生成${questionCount}道多选题，每题4个选项，只有1个正确答案。
        题目类型可以包括：选择正确释义、选择正确用法、选择近义词、选择反义词等。
        每道题目应包含：问题、4个选项、正确答案索引（0-3）、解释。
        
        请以JSON格式返回，格式为：
        [
          {
            "question": "问题内容",
            "options": ["选项A", "选项B", "选项C", "选项D"],
            "correctIndex": 0,
            "explanation": "为什么这是正确答案的解释"
          },
          ...
        ]
        `;
        
        try {
            const response = await this.sendRequest(prompt, {
                temperature: 0.7,
                maxTokens: API_CONFIG.features.quiz.maxTokens || 1500
            });
            
            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('生成词汇测试题失败:', error);
            throw new Error('无法生成词汇测试题，请稍后再试');
        }
    }

    /**
     * 生成学习报告
     * @param {string} reportType - 报告类型（'weekly', 'monthly', 'term'）
     * @param {Object} learningData - 学习数据
     * @returns {Promise<Object>} - 报告对象
     */
    async generateLearningReport(reportType, learningData) {
        const reportTypeName = reportType === 'weekly' ? '周报' : 
                               reportType === 'monthly' ? '月报' : '学期报告';
        
        const prompt = `
        请根据以下学习数据，生成一份${reportTypeName}：
        
        学习数据：${JSON.stringify(learningData)}
        
        请分析以下内容：
        1. 学习时间统计和趋势
        2. 单词学习情况（数量、记忆效果）
        3. 阅读学习情况（数量、难度、主题分布）
        4. 测试成绩分析（平均分、进步情况）
        5. 学习优势和弱点
        6. 针对性的学习建议
        
        请以JSON格式返回，格式为：
        {
          "title": "报告标题",
          "period": "报告周期",
          "summary": "总体学习情况概述",
          "timeStats": {
            "totalHours": 总学习小时数,
            "averageDaily": 日均学习小时数,
            "trend": "上升/下降/稳定"
          },
          "vocabulary": {
            "learned": 学习单词数,
            "mastered": 掌握单词数,
            "needReview": 需要复习的单词数
          },
          "reading": {
            "articles": 阅读文章数,
            "topTopics": ["常见主题1", "常见主题2"],
            "averageDifficulty": "难度评价"
          },
          "tests": {
            "completed": 完成测试数,
            "averageScore": 平均分数,
            "improvement": "进步情况"
          },
          "strengths": ["优势1", "优势2"],
          "weaknesses": ["弱点1", "弱点2"],
          "suggestions": ["建议1", "建议2", "建议3"]
        }
        `;
        
        try {
            const response = await this.sendRequest(prompt, {
                temperature: 0.7,
                maxTokens: API_CONFIG.features.achievements.maxTokens || 1500
            });
            
            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('生成学习报告失败:', error);
            throw new Error('无法生成学习报告，请稍后再试');
        }
    }
}

// 创建并导出AI服务实例
const aiService = new AIService();
export default aiService;