// 测试模块的AI增强版JavaScript功能实现

import { API_CONFIG, validateApiConfig } from './api-config.js';
import { AIService } from './ai-service.js';

// 初始化AI服务
const aiService = new AIService();

// DOM元素
const testSelection = document.getElementById('test-selection');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const reviewButton = document.getElementById('review-button');
const loadingIndicator = document.getElementById('loading-indicator');
const readingComprehension = document.getElementById('reading-comprehension');
const vocabularyTest = document.getElementById('vocabulary-test');

// 测试状态
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let userAnswers = [];
let testType = '';

// 从会话存储中获取当前阅读内容
const currentReading = JSON.parse(sessionStorage.getItem('currentReading') || 'null');

// 测试选择
readingComprehension.addEventListener('click', async () => {
    testType = 'reading';
    await generateQuiz('reading');
});

vocabularyTest.addEventListener('click', async () => {
    testType = 'vocabulary';
    await generateQuiz('vocabulary');
});

/**
 * 生成测试题
 * @param {string} type - 测试类型（'reading'或'vocabulary'）
 */
async function generateQuiz(type) {
    try {
        // 显示加载指示器
        loadingIndicator.classList.remove('hidden');
        
        // 如果没有当前阅读内容，使用默认内容或提示用户
        if (!currentReading) {
            alert('没有找到阅读内容，请先在阅读页面生成内容');
            window.location.href = 'reading.html';
            return;
        }
        
        // 根据类型生成不同的测试题
        if (type === 'reading') {
            currentQuestions = await generateReadingQuestions(currentReading);
        } else {
            currentQuestions = await generateVocabularyQuestions(currentReading);
        }
        
        // 重置测试状态
        currentQuestionIndex = 0;
        correctAnswers = 0;
        userAnswers = [];
        
        // 显示第一道题
        displayQuestion(currentQuestionIndex);
        
        // 隐藏选择界面，显示测试界面
        testSelection.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        
    } catch (error) {
        console.error('生成测试题失败:', error);
        alert(`生成测试题失败: ${error.message}`);
    } finally {
        // 隐藏加载指示器
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * 生成阅读理解题
 * @param {Object} reading - 阅读内容
 * @returns {Promise<Array>} - 问题数组
 */
async function generateReadingQuestions(reading) {
    // 构建提示词
    const prompt = `
    请根据以下英语阅读材料，生成5道多选题测试阅读理解：
    
    标题：${reading.title}
    内容：${reading.english}
    
    请生成5道多选题，每题4个选项，只有1个正确答案。
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
        // 发送请求到AI服务
        const response = await aiService.sendRequest(prompt, {
            temperature: 0.7,
            maxTokens: API_CONFIG.features.quiz.maxTokens || 1500
        });
        
        // 解析响应
        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('AI服务请求失败:', error);
        throw new Error('无法生成阅读理解题，请稍后再试');
    }
}

/**
 * 生成词汇测试题
 * @param {Object} reading - 阅读内容
 * @returns {Promise<Array>} - 问题数组
 */
async function generateVocabularyQuestions(reading) {
    // 构建提示词
    const prompt = `
    请根据以下词汇列表，生成5道多选题测试词汇掌握程度：
    
    ${JSON.stringify(reading.vocabulary)}
    
    请生成5道多选题，每题4个选项，只有1个正确答案。
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
        // 发送请求到AI服务
        const response = await aiService.sendRequest(prompt, {
            temperature: 0.7,
            maxTokens: API_CONFIG.features.quiz.maxTokens || 1500
        });
        
        // 解析响应
        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('AI服务请求失败:', error);
        throw new Error('无法生成词汇测试题，请稍后再试');
    }
}

/**
 * 显示当前问题
 * @param {number} index - 问题索引
 */
function displayQuestion(index) {
    const question = currentQuestions[index];
    
    // 更新问题文本
    questionText.textContent = question.question;
    
    // 清空选项容器
    optionsContainer.innerHTML = '';
    
    // 添加选项
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-3 cursor-pointer flex justify-between items-center';
        optionElement.innerHTML = `
            <span>${option}</span>
            <span class="option-selected hidden"><i class="fas fa-check-circle text-primary-500"></i></span>
        `;
        
        // 添加点击事件
        optionElement.addEventListener('click', () => selectOption(optionElement, i));
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 更新进度
    const progress = ((index + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `问题 ${index + 1}/${currentQuestions.length}`;
}

/**
 * 选择选项
 * @param {HTMLElement} optionElement - 选项元素
 * @param {number} optionIndex - 选项索引
 */
function selectOption(optionElement, optionIndex) {
    // 获取当前问题
    const question = currentQuestions[currentQuestionIndex];
    
    // 清除其他选项的选中状态
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.querySelector('.option-selected').classList.add('hidden');
        opt.classList.remove('correct', 'incorrect');
    });
    
    // 设置当前选项为选中状态
    optionElement.querySelector('.option-selected').classList.remove('hidden');
    
    // 记录用户答案
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // 显示正确/错误状态
    setTimeout(() => {
        options.forEach((opt, i) => {
            if (i === question.correctIndex) {
                opt.classList.add('correct');
            } else if (i === optionIndex && optionIndex !== question.correctIndex) {
                opt.classList.add('incorrect');
            }
        });
        
        // 如果答对了，增加正确答案计数
        if (optionIndex === question.correctIndex) {
            correctAnswers++;
        }
        
        // 显示解释
        const explanationElement = document.createElement('div');
        explanationElement.className = 'mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm';
        explanationElement.innerHTML = `<strong>解释：</strong>${question.explanation}`;
        
        // 检查是否已经添加了解释
        const existingExplanation = optionsContainer.querySelector('.mt-4');
        if (existingExplanation) {
            existingExplanation.remove();
        }
        
        optionsContainer.appendChild(explanationElement);
    }, 500);
}

// 下一题按钮
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    
    // 如果是最后一题，显示结果
    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
    } else {
        // 显示下一题
        displayQuestion(currentQuestionIndex);
    }
});

/**
 * 显示测试结果
 */
function showResults() {
    // 隐藏测试界面，显示结果界面
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    // 计算得分
    const score = Math.round((correctAnswers / currentQuestions.length) * 100);
    
    // 更新结果界面
    document.getElementById('score-value').textContent = score;
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('total-count').textContent = currentQuestions.length;
    
    // 根据得分显示不同的消息
    const scoreMessage = document.getElementById('score-message');
    if (score >= 90) {
        scoreMessage.textContent = '太棒了！你的理解非常出色！';
    } else if (score >= 70) {
        scoreMessage.textContent = '做得很好！你已经掌握了大部分内容。';
    } else if (score >= 50) {
        scoreMessage.textContent = '不错的尝试！继续努力，你会做得更好。';
    } else {
        scoreMessage.textContent = '这次有点困难，再多练习一下吧！';
    }
    
    // 保存测试结果到本地存储
    saveTestResult(score);
}

/**
 * 保存测试结果到本地存储
 * @param {number} score - 得分
 */
function saveTestResult(score) {
    // 获取现有的测试历史
    let testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    
    // 添加新的测试结果
    testHistory.push({
        type: testType,
        score: score,
        date: new Date().toISOString(),
        readingTitle: currentReading?.title || '未知阅读'
    });
    
    // 限制历史记录数量
    if (testHistory.length > 20) {
        testHistory = testHistory.slice(-20);
    }
    
    // 保存回本地存储
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
}

// 查看错题按钮
reviewButton.addEventListener('click', () => {
    // 隐藏结果界面，显示测试界面
    resultContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    
    // 重置到第一题
    currentQuestionIndex = 0;
    displayQuestion(currentQuestionIndex);
});

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 检查API配置
    if (!validateApiConfig()) {
        alert('API配置无效，请检查API密钥设置');
        readingComprehension.disabled = true;
        vocabularyTest.disabled = true;
    }
    
    // 如果从阅读页面跳转过来，自动开始阅读理解测试
    if (currentReading) {
        // 显示阅读标题
        const readingTitle = document.getElementById('reading-title');
        if (readingTitle) {
            readingTitle.textContent = currentReading.title || '未知阅读';
        }
    }
});