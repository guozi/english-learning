// 双语阅读模块的AI增强版JavaScript功能实现

import { API_CONFIG, validateApiConfig } from './api-config.js';
import aiService from './ai-service.js';

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
const parallelEnglish = document.getElementById('parallel-english');
const parallelChinese = document.getElementById('parallel-chinese');

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
 * 显示阅读内容
 * @param {Object} readingContent - 阅读内容对象
 */
function displayReadingContent(readingContent) {
    // 处理交替显示模式内容
    alternateView.innerHTML = '';
    
    // 将内容分段处理
    const paragraphs = readingContent.english.split('\n').filter(p => p.trim() !== '');
    const chineseParagraphs = readingContent.chinese.split('\n').filter(p => p.trim() !== '');
    
    // 创建交替显示的段落 - 一行英文一行中文的上下布局
    for (let i = 0; i < paragraphs.length; i++) {
        // 英文句子
        const englishSentence = document.createElement('p');
        englishSentence.className = 'text-lg leading-relaxed mb-1';
        englishSentence.innerHTML = paragraphs[i];
        alternateView.appendChild(englishSentence);
        
        // 中文句子
        const chineseSentence = document.createElement('p');
        chineseSentence.className = 'text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4';
        chineseSentence.textContent = chineseParagraphs[i] || '';
        alternateView.appendChild(chineseSentence);
    }
    
    // 处理并排显示模式内容
    parallelEnglish.innerHTML = '';
    parallelChinese.innerHTML = '';
    
    // 创建并排显示的段落
    paragraphs.forEach(paragraph => {
        const para = document.createElement('p');
        para.className = 'text-lg leading-relaxed';
        para.innerHTML = paragraph;
        parallelEnglish.appendChild(para);
    });
    
    chineseParagraphs.forEach(paragraph => {
        const para = document.createElement('p');
        para.className = 'text-base text-gray-600 dark:text-gray-400 leading-relaxed';
        para.textContent = paragraph;
        parallelChinese.appendChild(para);
    });
    
    // 显示词汇列表
    const vocabContainer = document.getElementById('vocab-container');
    vocabContainer.innerHTML = '';
    
    if (readingContent.vocabulary && readingContent.vocabulary.length > 0) {
        readingContent.vocabulary.forEach(vocab => {
            const vocabItem = document.createElement('div');
            vocabItem.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg';
            vocabItem.innerHTML = `
                <h3 class="font-bold text-primary-600 dark:text-primary-400">${vocab.word}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${vocab.meaning}</p>
                ${vocab.etymology ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">词根: ${vocab.etymology}</p>` : ''}
                ${vocab.example ? `<p class="text-sm italic mt-2">${vocab.example}</p>` : ''}
            `;
            vocabContainer.appendChild(vocabItem);
        });
    }
    
    // 高亮显示词汇
    if (readingContent.vocabulary && readingContent.vocabulary.length > 0) {
        highlightVocabulary(readingContent.vocabulary);
    }
}

/**
 * 在阅读内容中高亮显示词汇
 * @param {Array} vocabulary - 词汇数组
 */
function highlightVocabulary(vocabulary) {
    // 获取所有英文段落 - 在交替显示模式中，英文段落是每两个p元素中的第一个
    const alternateEnglishParagraphs = [];
    const allParagraphs = alternateView.querySelectorAll('p');
    
    // 筛选出英文段落（在交替显示模式中是奇数索引的段落）
    for (let i = 0; i < allParagraphs.length; i += 2) {
        alternateEnglishParagraphs.push(allParagraphs[i]);
    }
    
    const parallelParagraphs = parallelEnglish.querySelectorAll('p');
    
    // 处理每个词汇
    vocabulary.forEach(vocab => {
        const word = vocab.word;
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const tooltipContent = `<span class="word-tooltip"><strong>${vocab.meaning}</strong>${vocab.etymology ? `<br>词根: ${vocab.etymology}` : ''}${vocab.example ? `<br>例句: ${vocab.example}` : ''}</span>`;
        
        // 处理交替显示模式中的英文段落
        alternateEnglishParagraphs.forEach(paragraph => {
            paragraph.innerHTML = paragraph.innerHTML.replace(regex, `<span class="highlighted-word">$&${tooltipContent}</span>`);
        });
        
        // 处理并排显示模式中的段落
        parallelParagraphs.forEach(paragraph => {
            paragraph.innerHTML = paragraph.innerHTML.replace(regex, `<span class="highlighted-word">$&${tooltipContent}</span>`);
        });
    });
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