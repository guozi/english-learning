// 学习成就模块的AI增强版JavaScript功能实现

import { API_CONFIG, validateApiConfig } from './api-config.js';
import { AIService } from './ai-service.js';

// 初始化AI服务
const aiService = new AIService();

// DOM元素
const reportTypeBtns = document.querySelectorAll('.report-type-btn');
const generateReportBtn = document.getElementById('generate-report-btn');
const reportContainer = document.getElementById('report-container');
const loadingIndicator = document.getElementById('loading-indicator');
const posters = document.querySelectorAll('.achievement-poster');
const shareBtn = document.getElementById('share-poster-btn');

// 当前选择的报告类型
let selectedReportType = 'weekly';

// 报告类型按钮点击事件
reportTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有按钮的活跃状态
        reportTypeBtns.forEach(b => {
            b.classList.remove('bg-primary-100', 'dark:bg-primary-900', 'border-primary-500');
        });
        // 添加当前按钮的活跃状态
        btn.classList.add('bg-primary-100', 'dark:bg-primary-900', 'border-primary-500');
        // 更新选择的报告类型
        selectedReportType = btn.getAttribute('data-type');
    });
});

// 生成报告按钮点击事件
generateReportBtn.addEventListener('click', async () => {
    try {
        // 显示加载指示器
        loadingIndicator.classList.remove('hidden');
        
        // 显示生成中状态
        const originalText = generateReportBtn.innerHTML;
        generateReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
        generateReportBtn.disabled = true;
        
        // 获取学习数据
        const learningData = collectLearningData();
        
        // 生成学习报告
        const report = await generateLearningReport(selectedReportType, learningData);
        
        // 显示报告
        displayReport(report);
        
        // 显示报告容器
        reportContainer.classList.remove('hidden');
        
        // 保存报告到本地存储
        saveReportToLocalStorage(report);
        
        // 显示成功消息
        showNotification('报告生成成功！可在"我的报告"中查看', 'success');
    } catch (error) {
        console.error('生成报告失败:', error);
        alert(`生成报告失败: ${error.message}`);
    } finally {
        // 恢复按钮状态
        generateReportBtn.innerHTML = originalText;
        generateReportBtn.disabled = false;
        
        // 隐藏加载指示器
        loadingIndicator.classList.add('hidden');
    }
});

/**
 * 收集用户学习数据
 * @returns {Object} - 学习数据对象
 */
function collectLearningData() {
    // 从本地存储获取各种学习数据
    const flashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    
    // 计算学习时间（模拟数据）
    const learningTimeData = generateMockLearningTimeData();
    
    return {
        flashcards,
        readingHistory,
        testHistory,
        learningTimeData
    };
}

/**
 * 生成模拟学习时间数据
 * @returns {Object} - 学习时间数据
 */
function generateMockLearningTimeData() {
    // 生成过去30天的模拟学习时间数据
    const timeData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // 随机生成学习时间（10-120分钟）
        const minutes = Math.floor(Math.random() * 110) + 10;
        
        timeData.push({
            date: date.toISOString().split('T')[0],
            minutes: minutes
        });
    }
    
    return timeData;
}

/**
 * 调用AI服务生成学习报告
 * @param {string} reportType - 报告类型
 * @param {Object} learningData - 学习数据
 * @returns {Promise<Object>} - 报告对象
 */
async function generateLearningReport(reportType, learningData) {
    // 构建提示词
    const prompt = `
    请根据以下学习数据，生成一份${reportType === 'weekly' ? '周报' : reportType === 'monthly' ? '月报' : '学期报告'}：
    
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
        // 发送请求到AI服务
        const response = await aiService.sendRequest(prompt, {
            temperature: 0.7,
            maxTokens: API_CONFIG.features.achievements.maxTokens || 1500
        });
        
        // 解析响应
        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('AI服务请求失败:', error);
        throw new Error('无法生成学习报告，请稍后再试');
    }
}

/**
 * 显示学习报告
 * @param {Object} report - 报告对象
 */
function displayReport(report) {
    // 更新报告标题
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-period').textContent = report.period;
    
    // 更新报告内容
    document.getElementById('report-summary').textContent = report.summary;
    
    // 更新学习时间统计
    document.getElementById('total-hours').textContent = report.timeStats.totalHours;
    document.getElementById('average-daily').textContent = report.timeStats.averageDaily;
    document.getElementById('time-trend').textContent = report.timeStats.trend;
    
    // 更新单词学习情况
    document.getElementById('words-learned').textContent = report.vocabulary.learned;
    document.getElementById('words-mastered').textContent = report.vocabulary.mastered;
    document.getElementById('words-review').textContent = report.vocabulary.needReview;
    
    // 更新阅读学习情况
    document.getElementById('articles-read').textContent = report.reading.articles;
    document.getElementById('reading-topics').textContent = report.reading.topTopics.join(', ');
    document.getElementById('reading-difficulty').textContent = report.reading.averageDifficulty;
    
    // 更新测试成绩
    document.getElementById('tests-completed').textContent = report.tests.completed;
    document.getElementById('average-score').textContent = report.tests.averageScore;
    document.getElementById('score-improvement').textContent = report.tests.improvement;
    
    // 更新优势和弱点
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = '';
    report.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.className = 'mb-2 flex items-start';
        li.innerHTML = `
            <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
            <span>${strength}</span>
        `;
        strengthsList.appendChild(li);
    });
    
    const weaknessesList = document.getElementById('weaknesses-list');
    weaknessesList.innerHTML = '';
    report.weaknesses.forEach(weakness => {
        const li = document.createElement('li');
        li.className = 'mb-2 flex items-start';
        li.innerHTML = `
            <i class="fas fa-exclamation-circle text-yellow-500 mr-2 mt-1"></i>
            <span>${weakness}</span>
        `;
        weaknessesList.appendChild(li);
    });
    
    // 更新学习建议
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    report.suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.className = 'mb-3 flex items-start';
        li.innerHTML = `
            <i class="fas fa-lightbulb text-primary-500 mr-2 mt-1"></i>
            <span>${suggestion}</span>
        `;
        suggestionsList.appendChild(li);
    });
}

/**
 * 保存报告到本地存储
 * @param {Object} report - 报告对象
 */
function saveReportToLocalStorage(report) {
    // 获取现有的报告历史
    let reportHistory = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    
    // 添加新的报告，带上时间戳
    report.timestamp = Date.now();
    reportHistory.unshift(report);
    
    // 限制历史记录数量
    if (reportHistory.length > 10) {
        reportHistory = reportHistory.slice(0, 10);
    }
    
    // 保存回本地存储
    localStorage.setItem('reportHistory', JSON.stringify(reportHistory));
}

// 海报选择事件
let selectedPoster = null;

posters.forEach(poster => {
    poster.addEventListener('click', () => {
        // 移除所有海报的选中状态
        posters.forEach(p => {
            p.classList.remove('ring-4', 'ring-primary-500');
        });
        // 添加当前海报的选中状态
        poster.classList.add('ring-4', 'ring-primary-500');
        selectedPoster = poster;
    });
});

// 分享按钮点击事件
shareBtn.addEventListener('click', () => {
    if (!selectedPoster) {
        showNotification('请先选择一个海报样式', 'warning');
        return;
    }
    
    // 显示分享中状态
    const originalText = shareBtn.innerHTML;
    shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>准备分享...';
    shareBtn.disabled = true;
    
    // 模拟分享的延迟
    setTimeout(() => {
        // 恢复按钮状态
        shareBtn.innerHTML = originalText;
        shareBtn.disabled = false;
        
        // 显示分享对话框
        showShareDialog();
    }, 1000);
});

/**
 * 显示分享对话框
 */
function showShareDialog() {
    // 创建对话框元素
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">分享学习成就</h3>
            <div class="mb-4">
                <p class="text-gray-700 dark:text-gray-300 mb-2">选择分享方式：</p>
                <div class="flex space-x-4">
                    <button class="p-2 bg-blue-500 text-white rounded-full"><i class="fab fa-weixin"></i></button>
                    <button class="p-2 bg-blue-400 text-white rounded-full"><i class="fab fa-qq"></i></button>
                    <button class="p-2 bg-red-500 text-white rounded-full"><i class="fab fa-weibo"></i></button>
                    <button class="p-2 bg-gray-700 text-white rounded-full"><i class="fas fa-link"></i></button>
                </div>
            </div>
            <div class="flex justify-end">
                <button id="close-dialog" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg">关闭</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(dialog);
    
    // 添加关闭按钮事件
    document.getElementById('close-dialog').addEventListener('click', () => {
        dialog.remove();
    });
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-y-20 opacity-0 flex items-center ${type === 'success' ? 'bg-green-500 text-white' : type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}`;
    
    // 设置图标
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon} mr-2"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
    }, 10);
    
    // 自动关闭通知
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 检查API配置
    if (!validateApiConfig()) {
        alert('API配置无效，请检查API密钥设置');
        generateReportBtn.disabled = true;
    }
});