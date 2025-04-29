// 测试模块的AI增强版JavaScript功能实现

import { API_CONFIG, validateApiConfig } from './api-config.js';
import aiService from './ai-service.js';


// DOM元素
const testSelection = document.getElementById('test-selection');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
const passageText = document.getElementById('passage-text');
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
            currentQuestions = await aiService.generateReadingQuestions(currentReading.english);
        } else {
            currentQuestions = await aiService.generateVocabularyQuestions(currentReading.vocabulary);
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
 * 显示当前问题
 * @param {number} index - 问题索引
 */
function displayQuestion(index) {
    const question = currentQuestions[index];

    // 更新问题内容
    passageText.textContent = currentReading.english;
    
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
    document.getElementById('result-percentage').textContent = `${score}%`;
    document.getElementById('correct-count').textContent = `正确: ${correctAnswers}`;
    document.getElementById('incorrect-count').textContent = `错误: ${currentQuestions.length - correctAnswers}`;
    document.getElementById('points-earned').textContent = `得分: ${score}`;
    
    // 设置测试类型和时间
    document.getElementById('result-test-type').textContent = testType === 'reading' ? '阅读理解测试' : '词汇测试';
    document.getElementById('result-time').textContent = `完成时间: ${new Date().toLocaleString()}`;
    
    // 根据得分生成改进建议
    const improvementAreas = document.getElementById('improvement-areas');
    improvementAreas.innerHTML = '';
    
    if (score < 80) {
        const suggestions = [
            '加强阅读理解能力，注重把握文章主旨',
            '扩大词汇量，特别是关键学术词汇',
            '练习识别文章的逻辑结构和论证方式'
        ];
        
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            improvementAreas.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = '你的表现很好！继续保持这种学习状态。';
        improvementAreas.appendChild(li);
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
    
    // 筛选出用户答错的题目
    const incorrectQuestions = [];
    const incorrectIndices = [];
    
    userAnswers.forEach((answer, index) => {
        if (answer !== currentQuestions[index].correctIndex) {
            incorrectQuestions.push(currentQuestions[index]);
            incorrectIndices.push(index);
        }
    });
    
    // 如果没有错题，显示提示
    if (incorrectQuestions.length === 0) {
        alert('恭喜！您没有答错任何题目！');
        resultContainer.classList.remove('hidden');
        quizContainer.classList.add('hidden');
        return;
    }
    
    // 创建一个临时变量来保存原始题目，以便在查看错题后可以恢复
    const originalQuestions = [...currentQuestions];
    const originalUserAnswers = [...userAnswers];
    // 保存原始的正确答案数量
    const originalCorrectAnswers = correctAnswers;
    
    // 替换为只包含错题的数组
    currentQuestions = incorrectQuestions;
    
    // 重置到第一题
    currentQuestionIndex = 0;
    
    // 更新问题计数器文本
    questionCounter.textContent = `错题 1/${incorrectQuestions.length}`;
    
    // 显示第一道错题
    displayIncorrectQuestion(currentQuestionIndex, incorrectIndices[currentQuestionIndex], originalUserAnswers);
    
    // 保存原始的下一题按钮点击处理函数
    const originalNextButtonHandler = nextButton.onclick;
    
    // 创建新的下一题按钮处理函数
    function reviewNextHandler() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex >= incorrectQuestions.length) {
            // 恢复原始题目和用户答案
            currentQuestions = originalQuestions;
            userAnswers = originalUserAnswers;
            // 恢复原始的正确答案数量
            correctAnswers = originalCorrectAnswers;
            
            // 恢复下一题按钮的原始行为
            nextButton.onclick = originalNextButtonHandler;
            
            // 返回结果页面
            quizContainer.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        } else {
            // 显示下一道错题
            displayIncorrectQuestion(currentQuestionIndex, incorrectIndices[currentQuestionIndex], originalUserAnswers);
            
            // 更新问题计数器
            questionCounter.textContent = `错题 ${currentQuestionIndex + 1}/${incorrectQuestions.length}`;
            
            // 更新进度条
            const progress = ((currentQuestionIndex + 1) / incorrectQuestions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    // 替换下一题按钮的点击处理函数
    nextButton.onclick = reviewNextHandler;
});

/**
 * 显示错误的问题，并标记用户的错误选择和正确答案
 * @param {number} index - 当前错题索引
 * @param {number} originalIndex - 原始题目中的索引
 * @param {Array} originalAnswers - 原始用户答案
 */
function displayIncorrectQuestion(index, originalIndex, originalAnswers) {
    const question = currentQuestions[index];

    // 更新问题内容
    passageText.textContent = currentReading.english;
    
    // 更新问题文本
    questionText.textContent = question.question;
    
    // 清空选项容器
    optionsContainer.innerHTML = '';
    
    // 获取用户的错误选择
    const userWrongAnswer = originalAnswers[originalIndex];
    
    // 添加选项
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        let className = 'quiz-option bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-3 flex justify-between items-center';
        
        // 标记正确答案和用户错误选择
        if (i === question.correctIndex) {
            className += ' correct';
        } else if (i === userWrongAnswer) {
            className += ' incorrect';
        }
        
        optionElement.className = className;
        
        // 添加选项内容
        optionElement.innerHTML = `
            <span>${option}</span>
            <span class="option-marker">
                ${i === question.correctIndex ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}
                ${i === userWrongAnswer ? '<i class="fas fa-times-circle text-red-500"></i>' : ''}
            </span>
        `;
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 显示解释
    const explanationElement = document.createElement('div');
    explanationElement.className = 'mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm';
    explanationElement.innerHTML = `<strong>解释：</strong>${question.explanation}`;
    optionsContainer.appendChild(explanationElement);
}

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