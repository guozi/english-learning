// 测试模块的JavaScript功能实现

// 测试选择
const readingComprehension = document.getElementById('reading-comprehension');
const vocabularyTest = document.getElementById('vocabulary-test');
const testSelection = document.getElementById('test-selection');
const quizContainer = document.getElementById('quiz-container');

readingComprehension.addEventListener('click', () => {
    testSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
});

vocabularyTest.addEventListener('click', () => {
    testSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
});

// 选项选择
const quizOptions = document.querySelectorAll('.quiz-option');
quizOptions.forEach(option => {
    option.addEventListener('click', () => {
        // 清除其他选项的选中状态
        quizOptions.forEach(opt => {
            opt.querySelector('.option-selected').classList.add('hidden');
        });
        // 设置当前选项为选中状态
        option.querySelector('.option-selected').classList.remove('hidden');
        
        // 模拟答案反馈（实际应用中应根据正确答案判断）
        setTimeout(() => {
            quizOptions.forEach(opt => {
                opt.classList.remove('correct', 'incorrect');
            });
            
            // 假设第二个选项是正确答案
            quizOptions[1].classList.add('correct');
            
            // 如果选择的不是正确答案，标记为错误
            if (option !== quizOptions[1]) {
                option.classList.add('incorrect');
            }
        }, 500);
    });
});

// 下一题按钮
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const progressBar = document.getElementById('progress-bar');
const questionCounter = document.getElementById('question-counter');
let currentQuestion = 1;
const totalQuestions = 10;

nextButton.addEventListener('click', () => {
    currentQuestion++;
    
    // 更新进度
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
    questionCounter.textContent = `问题 ${currentQuestion}/${totalQuestions}`;
    
    // 如果是最后一题，显示结果
    if (currentQuestion > totalQuestions) {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    }
});

// 查看错题按钮
const reviewButton = document.getElementById('review-button');
reviewButton.addEventListener('click', () => {
    resultContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    // 重置进度
    currentQuestion = 1;
    progressBar.style.width = '10%';
    questionCounter.textContent = `问题 1/${totalQuestions}`;
});