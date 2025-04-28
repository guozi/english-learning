// 闪卡模块的JavaScript功能实现 - AI增强版

// 导入AI服务
import aiService from './ai-service.js';
import { API_CONFIG } from './api-config.js';

// 闪卡功能
const flashcard = document.getElementById('flashcard');
const extractWordsBtn = document.getElementById('extract-words');
const clearTextBtn = document.getElementById('clear-text');
const inputText = document.getElementById('input-text');
const difficultyLevel = document.getElementById('difficulty-level'); // 单词级别选择
const flashcardsContainer = document.getElementById('flashcards-container');
const extractionResults = document.getElementById('extraction-results');
const wordCount = document.getElementById('word-count');
const wordList = document.getElementById('word-list');
const prevCardBtn = document.getElementById('prev-card');
const nextCardBtn = document.getElementById('next-card');
const currentCardIndex = document.getElementById('current-card-index');
const totalCards = document.getElementById('total-cards');
const loadingIndicator = document.getElementById('loading-indicator'); // 确保HTML中添加了这个元素

// 单词数据
let words = [];

// 尝试从本地存储加载单词
function loadWordsFromLocalStorage() {
    const savedWords = localStorage.getItem('flashcards');
    if (savedWords) {
        try {
            words = JSON.parse(savedWords);
        } catch (e) {
            console.error('加载保存的单词失败:', e);
            // 使用示例数据作为后备
            words = [
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
    } else {
        // 如果没有保存的数据，使用示例数据
        words = [
            {
                word: 'vocabulary',
                phonetic: '/vəˈkæbjələri/',
                definition: 'n. 词汇表；词汇量',
                etymology: '来自拉丁语 vocabularium，由 vocab(呼唤) + -ary(表名词)',
                example: 'Reading books is a great way to expand your vocabulary.',
                exampleTranslation: '阅读书籍是扩大词汇量的好方法。'
            },
            {
                word: 'enhance',
                phonetic: '/ɪnˈhæns/',
                definition: 'v. 提高；增强；加强',
                etymology: '来自古法语 enhancer，en-(使) + hancer(提高)',
                example: 'The new features will enhance the user experience.',
                exampleTranslation: '新功能将提升用户体验。'
            },
            {
                word: 'comprehension',
                phonetic: '/ˌkɒmprɪˈhenʃn/',
                definition: 'n. 理解；领悟；包含',
                etymology: '来自拉丁语 comprehensionem，com-(完全) + prehendere(抓住)',
                example: 'Reading comprehension is an essential skill for students.',
                exampleTranslation: '阅读理解是学生的一项基本技能。'
            }
        ];
    }
}

// 保存单词到本地存储
function saveWordsToLocalStorage(wordsToSave) {
    try {
        localStorage.setItem('flashcards', JSON.stringify(wordsToSave));
    } catch (e) {
        console.error('保存单词失败:', e);
    }
}

let currentIndex = 0;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadWordsFromLocalStorage();
    if (words.length > 0) {
        flashcardsContainer.classList.remove('hidden');
        extractionResults.classList.remove('hidden');
        updateCardDisplay();
    }
});

// 闪卡翻转
flashcard.addEventListener('click', () => {
    // 添加过渡动画类
    const flashcardInner = document.querySelector('.flashcard-inner');
    if (flashcardInner) {
        // 确保翻转动画流畅
        flashcardInner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
    }
    
    // 切换翻转状态
    flashcard.classList.toggle('flipped');
    
    // 在移动设备上，翻转后调整滚动位置，确保内容可见
    if (window.innerWidth < 768 && flashcard.classList.contains('flipped')) {
        // 延迟执行，等待翻转动画完成
        setTimeout(() => {
            // 确保卡片在视口中居中
            flashcard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
});

// 提取单词按钮点击事件
extractWordsBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (text) {
        try {
            // 显示加载指示器
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
            }
            extractWordsBtn.disabled = true;
            
            // 获取用户选择的单词级别
            const level = difficultyLevel.value;
            
            // 使用AI服务提取单词，传递文本、最大单词数和级别
            words = await aiService.extractWords(text, API_CONFIG.features.flashcards.maxWords, level);
            
            // 更新UI
            extractWords(words);
            flashcardsContainer.classList.remove('hidden');
            extractionResults.classList.remove('hidden');
            updateCardDisplay();
        } catch (error) {
            console.error('提取单词失败:', error);
            alert(`提取单词失败: ${error.message}`);
        } finally {
            // 隐藏加载指示器
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
            extractWordsBtn.disabled = false;
        }
    }
});

// 清空按钮点击事件
clearTextBtn.addEventListener('click', () => {
    inputText.value = '';
    flashcardsContainer.classList.add('hidden');
    extractionResults.classList.add('hidden');
});

// 上一张卡片
prevCardBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCardDisplay();
    }
});

// 下一张卡片
nextCardBtn.addEventListener('click', () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateCardDisplay();
    }
});

// 更新卡片显示
function updateCardDisplay() {
    if (words.length > 0) {
        const word = words[currentIndex];
        
        // 获取屏幕宽度，用于响应式调整
        const isMobile = window.innerWidth < 768;
        
        // 调整闪卡容器大小，确保内容适合
        const flashcardElement = document.getElementById('flashcard');
        if (flashcardElement) {
            // 根据设备类型设置不同的高度
            flashcardElement.style.height = isMobile ? 'auto' : '450px';
            flashcardElement.style.minHeight = isMobile ? '350px' : '450px';
            flashcardElement.style.maxHeight = isMobile ? '80vh' : '550px';
            // 确保卡片宽度适应不同屏幕
            flashcardElement.style.width = '100%';
            flashcardElement.style.maxWidth = isMobile ? '95%' : '500px';
            // 添加溢出处理
            flashcardElement.style.overflow = 'hidden';
        }
        
        // 调整卡片内部容器
        const innerCard = document.querySelector('.flashcard-inner');
        if (innerCard) {
            innerCard.style.width = '100%';
            innerCard.style.height = '100%';
        }
        
        // 调整卡片正面和背面
        const frontCard = document.querySelector('.flashcard-front');
        const backCard = document.querySelector('.flashcard-back');
        
        if (frontCard && backCard) {
            // 设置内边距，移动端更紧凑
            frontCard.style.padding = isMobile ? '1rem' : '1.5rem';
            backCard.style.padding = isMobile ? '1rem' : '1.5rem';
            
            // 确保背面有滚动功能但不影响布局
            backCard.style.overflowY = 'auto';
            backCard.style.display = 'flex';
            backCard.style.flexDirection = 'column';
        }
        
        // 更新正面 - 添加响应式字体大小
        const wordElement = document.getElementById('word');
        const phoneticElement = document.getElementById('phonetic');
        
        if (wordElement && phoneticElement) {
            // 清除之前的类
            wordElement.className = '';
            phoneticElement.className = '';
            
            // 添加响应式类
            wordElement.classList.add(
                'text-2xl', 'md:text-3xl', 'lg:text-4xl',
                'font-bold', 'mb-2', 'text-primary-700',
                'dark:text-primary-400', 'text-center'
            );
            phoneticElement.classList.add(
                'text-md', 'md:text-lg',
                'text-gray-600', 'dark:text-gray-400',
                'text-center'
            );
            
            // 设置内容
            wordElement.textContent = word.word;
            phoneticElement.textContent = word.phonetic;
        }
        
        // 更新背面 - 优化布局
        const wordBackElement = document.getElementById('word-back');
        const phoneticBackElement = document.getElementById('phonetic-back');
        const definitionElement = document.getElementById('definition');
        const etymologyElement = document.getElementById('etymology');
        const exampleElement = document.getElementById('example');
        const exampleTranslationElement = document.getElementById('example-translation');
        
        // 清除之前的类
        [wordBackElement, phoneticBackElement, definitionElement, 
         etymologyElement, exampleElement, exampleTranslationElement].forEach(el => {
            if (el) el.className = '';
        });
        
        // 设置背面标题样式
        if (wordBackElement && phoneticBackElement) {
            wordBackElement.classList.add(
                'text-xl', 'md:text-2xl', 'font-bold',
                'text-primary-700', 'dark:text-primary-400'
            );
            phoneticBackElement.classList.add(
                'text-sm', 'md:text-md', 'text-gray-600',
                'dark:text-gray-400', 'mb-3'
            );
            
            // 设置内容
            wordBackElement.textContent = word.word;
            phoneticBackElement.textContent = word.phonetic;
        }
        
        // 优化背面内容区域
        const contentContainer = document.querySelector('.flashcard-back .flex-grow');
        if (contentContainer) {
            contentContainer.style.display = 'flex';
            contentContainer.style.flexDirection = 'column';
            contentContainer.style.gap = '0.75rem';
            contentContainer.style.overflowY = 'auto';
        }
        
        // 设置标题样式
        const titleElements = document.querySelectorAll('.flashcard-back h4');
        titleElements.forEach(el => {
            el.classList.add(
                'font-semibold', 'text-gray-800',
                'dark:text-gray-200', 'text-sm', 'md:text-base'
            );
        });
        
        // 设置内容样式和文本
        if (definitionElement) {
            definitionElement.classList.add(
                'text-sm', 'md:text-base', 'text-gray-700',
                'dark:text-gray-300', 'break-words'
            );
            definitionElement.textContent = word.definition;
        }
        
        if (etymologyElement) {
            etymologyElement.classList.add(
                'text-sm', 'md:text-base', 'text-gray-700',
                'dark:text-gray-300', 'break-words'
            );
            etymologyElement.textContent = word.etymology;
        }
        
        if (exampleElement) {
            exampleElement.classList.add(
                'text-sm', 'md:text-base', 'text-gray-700',
                'dark:text-gray-300', 'italic', 'break-words'
            );
            exampleElement.textContent = word.example;
        }
        
        if (exampleTranslationElement) {
            exampleTranslationElement.classList.add(
                'text-xs', 'md:text-sm', 'text-gray-600',
                'dark:text-gray-400', 'break-words'
            );
            exampleTranslationElement.textContent = word.exampleTranslation;
        }
        
        // 更新计数器
        currentCardIndex.textContent = currentIndex + 1;
        totalCards.textContent = words.length;
        
        // 确保卡片显示正面
        if (flashcard.classList.contains('flipped')) {
            flashcard.classList.remove('flipped');
        }
    }
}

// 提取单词函数
function extractWords(words) {
    // 更新单词计数
    wordCount.textContent = words.length;
    
    // 清空并更新单词列表
    wordList.innerHTML = '';
    words.forEach(word => {
        const wordTag = document.createElement('span');
        wordTag.className = 'px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm';
        wordTag.textContent = word.word;
        wordList.appendChild(wordTag);
    });
    
    // 保存到本地存储以便后续使用
    saveWordsToLocalStorage(words);
}

// 滑动操作
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0; // 添加Y轴触摸点，用于区分垂直滚动和水平滑动
let touchEndY = 0;

const swipeContainer = document.querySelector('.swipe-container');

// 确保swipeContainer存在
if (swipeContainer) {
    // 触摸开始事件
    swipeContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });

    // 触摸结束事件
    swipeContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    // 添加鼠标事件支持，使桌面端也能通过拖拽切换卡片
    let isDragging = false;
    let startX = 0;

    swipeContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        // 防止拖拽时选中文本
        e.preventDefault();
    });

    swipeContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        // 可以添加拖拽视觉反馈
    });

    swipeContainer.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        const endX = e.clientX;
        const diffX = endX - startX;
        
        if (Math.abs(diffX) > 50) { // 使用与触摸相同的阈值
            if (diffX > 0 && currentIndex > 0) {
                // 向右拖拽 - 上一张
                currentIndex--;
                updateCardDisplay();
            } else if (diffX < 0 && currentIndex < words.length - 1) {
                // 向左拖拽 - 下一张
                currentIndex++;
                updateCardDisplay();
            }
        }
        
        isDragging = false;
    });

    // 如果鼠标离开容器，取消拖拽状态
    swipeContainer.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

function handleSwipe() {
    const swipeThreshold = 50; // 滑动阈值
    const verticalThreshold = 75; // 垂直移动阈值，用于区分滚动和滑动
    
    // 计算水平和垂直移动距离
    const horizontalDistance = touchEndX - touchStartX;
    const verticalDistance = Math.abs(touchEndY - touchStartY);
    
    // 只有当水平移动大于阈值且垂直移动小于阈值时才视为有效滑动
    // 这样可以避免用户在滚动页面时意外触发滑动
    if (Math.abs(horizontalDistance) > swipeThreshold && verticalDistance < verticalThreshold) {
        if (horizontalDistance < 0) {
            // 向左滑动 - 下一张
            if (currentIndex < words.length - 1) {
                currentIndex++;
                updateCardDisplay();
            }
        } else {
            // 向右滑动 - 上一张
            if (currentIndex > 0) {
                currentIndex--;
                updateCardDisplay();
            }
        }
    }
}

// 添加窗口大小变化监听，以便在屏幕尺寸变化时重新调整卡片大小
window.addEventListener('resize', () => {
    // 延迟执行以避免频繁触发
    if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
    }
    window.resizeTimeout = setTimeout(() => {
        updateCardDisplay();
    }, 250);
});