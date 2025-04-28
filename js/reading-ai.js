// 双语阅读模块的AI增强版JavaScript功能实现

import { API_CONFIG, validateApiConfig } from './api-config.js';
import { AIService } from './ai-service.js';

// 初始化AI服务
const aiService = new AIService();

// DOM元素
const generateButton = document.getElementById('generate-button');
const readingContainer = document.getElementById('reading-container');
const vocabularyList = document.getElementById('vocabulary-list');
const loadingIndicator = document.getElementById('loading-indicator');
const alternateView = document.getElementById('alternate-view');
const parallelView = document.getElementById('parallel-view');
const toggleViewButton = document.getElementById('toggle-view');
const audioButton = document.getElementById('audio-button');
const saveButton = document.getElementById('save-button');
const quizButton = document.getElementById('quiz-button');

// 当前阅读内容
let currentReading = {
    english: '',
    chinese: '',
    vocabulary: []
};

// 生成双语阅读内容
generateButton.addEventListener('click', async () => {
    try {
        // 显示加载指示器
        loadingIndicator.classList.remove('hidden');

        const inputText = document.getElementById('input-text').value.trim();
        const inputLanguage = document.getElementById('input-language').value;
    
        if (!inputText) {
            alert('请输入需要翻译的文本');
            return;
        }
        
        // 调用AI服务生成阅读内容
        const readingContent = await aiService.generateReadingContent(inputText, inputLanguage);
        
        // 更新当前阅读内容
        currentReading = readingContent;
        
        // 显示阅读内容
        displayReadingContent(readingContent);
        
        // 显示阅读容器和词汇列表
        readingContainer.classList.remove('hidden');
        vocabularyList.classList.remove('hidden');
        
        // 保存到本地存储
        saveReadingToLocalStorage(readingContent);
    } catch (error) {
        console.error('生成阅读内容失败:', error);
        alert(`生成阅读内容失败: ${error.message}`);
    } finally {
        // 隐藏加载指示器
        loadingIndicator.classList.add('hidden');
    }
});

/**
 * 调用AI服务生成阅读内容
 * @param {string} topic - 阅读主题
 * @param {string} level - 难度级别
 * @returns {Promise<Object>} - 阅读内容对象
 */
async function generateReadingContent(topic, level) {
    // 构建提示词
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
        // 发送请求到AI服务
        const response = await aiService.sendRequest(prompt, {
            temperature: 0.7,
            maxTokens: API_CONFIG.features.reading.maxTokens || 2000
        });
        
        // 解析响应
        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('AI服务请求失败:', error);
        throw new Error('无法生成阅读内容，请稍后再试');
    }
}

/**
 * 显示阅读内容
 * @param {Object} readingContent - 阅读内容对象
 */
function displayReadingContent(readingContent) {
    // 显示标题
    document.getElementById('reading-title').textContent = readingContent.title;
    
    // 显示英语原文
    const englishContent = document.getElementById('english-content');
    englishContent.innerHTML = readingContent.english;
    
    // 显示中文翻译
    const chineseContent = document.getElementById('chinese-content');
    chineseContent.innerHTML = readingContent.chinese;
    
    // 显示平行视图
    const parallelEnglish = document.getElementById('parallel-english');
    const parallelChinese = document.getElementById('parallel-chinese');
    parallelEnglish.innerHTML = readingContent.english;
    parallelChinese.innerHTML = readingContent.chinese;
    
    // 显示词汇列表
    const vocabContainer = document.getElementById('vocab-container');
    vocabContainer.innerHTML = '';
    
    readingContent.vocabulary.forEach(vocab => {
        const vocabItem = document.createElement('div');
        vocabItem.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3';
        vocabItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white">${vocab.word}</h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">${vocab.phonetic}</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-2">${vocab.meaning}</p>
            <p class="text-gray-600 dark:text-gray-400 italic text-sm">${vocab.example}</p>
        `;
        vocabContainer.appendChild(vocabItem);
    });
    
    // 高亮显示词汇
    highlightVocabulary(readingContent.vocabulary);
}

/**
 * 在阅读内容中高亮显示词汇
 * @param {Array} vocabulary - 词汇数组
 */
function highlightVocabulary(vocabulary) {
    const englishContent = document.getElementById('english-content');
    const parallelEnglish = document.getElementById('parallel-english');
    
    let html = englishContent.innerHTML;
    
    vocabulary.forEach(vocab => {
        const word = vocab.word;
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        html = html.replace(regex, `<span class="highlighted-word" data-word="${word}">$&<div class="word-tooltip">${vocab.meaning}</div></span>`);
    });
    
    englishContent.innerHTML = html;
    parallelEnglish.innerHTML = html;
}

/**
 * 保存阅读内容到本地存储
 * @param {Object} readingContent - 阅读内容对象
 */
function saveReadingToLocalStorage(readingContent) {
    // 获取现有的阅读历史
    let readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
    
    // 添加新的阅读内容，带上时间戳
    readingContent.timestamp = Date.now();
    readingHistory.unshift(readingContent);
    
    // 限制历史记录数量
    if (readingHistory.length > 10) {
        readingHistory = readingHistory.slice(0, 10);
    }
    
    // 保存回本地存储
    localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
}

// 切换显示模式
toggleViewButton.addEventListener('click', () => {
    const alternateViewText = document.getElementById('alternate-view-text');
    const parallelViewText = document.getElementById('parallel-view-text');

    if (alternateView.classList.contains('hidden')) {
        alternateView.classList.remove('hidden');
        parallelView.classList.add('hidden');
        alternateViewText.classList.add('hidden');
        parallelViewText.classList.remove('hidden');
    } else {
        alternateView.classList.add('hidden');
        parallelView.classList.remove('hidden');
        alternateViewText.classList.remove('hidden');
        parallelViewText.classList.add('hidden');
    }
});

// 朗读功能
audioButton.addEventListener('click', () => {
    if (!currentReading.english) {
        alert('请先生成阅读内容');
        return;
    }
    
    // 使用浏览器的语音合成API
    const utterance = new SpeechSynthesisUtterance(currentReading.english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
});

// 保存到收藏
saveButton.addEventListener('click', () => {
    if (!currentReading.english) {
        alert('请先生成阅读内容');
        return;
    }
    
    // 获取现有的收藏
    let favorites = JSON.parse(localStorage.getItem('readingFavorites') || '[]');
    
    // 检查是否已经收藏
    const alreadySaved = favorites.some(item => item.title === currentReading.title);
    if (alreadySaved) {
        alert('此阅读内容已在收藏中');
        return;
    }
    
    // 添加到收藏
    favorites.push({
        ...currentReading,
        savedAt: Date.now()
    });
    
    // 保存回本地存储
    localStorage.setItem('readingFavorites', JSON.stringify(favorites));
    
    alert('内容已保存到收藏');
});

// 生成理解测试
quizButton.addEventListener('click', () => {
    if (!currentReading.english) {
        alert('请先生成阅读内容');
        return;
    }
    
    // 保存当前阅读内容到会话存储，以便在测试页面使用
    sessionStorage.setItem('currentReading', JSON.stringify(currentReading));
    
    // 跳转到测试页面
    window.location.href = 'quiz.html';
});

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 检查API配置
    if (!validateApiConfig()) {
        alert('API配置无效，请检查API密钥设置');
        generateButton.disabled = true;
    }
});