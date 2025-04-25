// 闪卡模块的JavaScript功能实现

// 闪卡功能
const flashcard = document.getElementById('flashcard');
const extractWordsBtn = document.getElementById('extract-words');
const clearTextBtn = document.getElementById('clear-text');
const inputText = document.getElementById('input-text');
const flashcardsContainer = document.getElementById('flashcards-container');
const extractionResults = document.getElementById('extraction-results');
const wordCount = document.getElementById('word-count');
const wordList = document.getElementById('word-list');
const prevCardBtn = document.getElementById('prev-card');
const nextCardBtn = document.getElementById('next-card');
const currentCardIndex = document.getElementById('current-card-index');
const totalCards = document.getElementById('total-cards');

// 示例单词数据
let words = [
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

let currentIndex = 0;

// 闪卡翻转
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

// 提取单词按钮点击事件
extractWordsBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (text) {
        // 这里应该是实际的单词提取算法
        // 现在使用示例数据
        extractWords(text);
        flashcardsContainer.classList.remove('hidden');
        extractionResults.classList.remove('hidden');
        updateCardDisplay();
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
        
        // 更新正面
        document.getElementById('word').textContent = word.word;
        document.getElementById('phonetic').textContent = word.phonetic;
        
        // 更新背面
        document.getElementById('word-back').textContent = word.word;
        document.getElementById('phonetic-back').textContent = word.phonetic;
        document.getElementById('definition').textContent = word.definition;
        document.getElementById('etymology').textContent = word.etymology;
        document.getElementById('example').textContent = word.example;
        document.getElementById('example-translation').textContent = word.exampleTranslation;
        
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
function extractWords(text) {
    // 这里应该是实际的单词提取算法
    // 现在使用示例数据
    
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
}

// 滑动操作
let touchStartX = 0;
let touchEndX = 0;

const swipeContainer = document.querySelector('.swipe-container');

swipeContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

swipeContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; // 滑动阈值
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // 向左滑动 - 下一张
        if (currentIndex < words.length - 1) {
            currentIndex++;
            updateCardDisplay();
        }
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // 向右滑动 - 上一张
        if (currentIndex > 0) {
            currentIndex--;
            updateCardDisplay();
        }
    }
}