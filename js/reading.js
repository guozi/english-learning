// 双语阅读模块的JavaScript功能实现

// 生成双语阅读内容
document.getElementById('generate-button').addEventListener('click', () => {
    const inputText = document.getElementById('input-text').value.trim();
    const inputLanguage = document.getElementById('input-language').value;
    
    if (!inputText) {
        alert('请输入需要翻译的文本');
        return;
    }
    
    // 在实际应用中，这里应该发送请求到后端处理
    // 这里仅做演示，直接显示预设内容
    document.getElementById('reading-container').classList.remove('hidden');
    document.getElementById('vocabulary-list').classList.remove('hidden');
    
    // 根据输入语言设置示例内容的显示顺序
    // 实际应用中应该调用翻译API
    console.log(`处理${inputLanguage === 'en' ? '英文' : '中文'}输入: ${inputText}`);
    
    // 滚动到阅读区域
    document.getElementById('reading-container').scrollIntoView({ behavior: 'smooth' });
});

// 切换显示模式
document.getElementById('toggle-view').addEventListener('click', () => {
    const alternateView = document.getElementById('alternate-view');
    const parallelView = document.getElementById('parallel-view');
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
document.getElementById('audio-button').addEventListener('click', () => {
    // 在实际应用中，这里应该调用语音合成API
    alert('朗读功能将在实际应用中启用');
});

// 保存到收藏
document.getElementById('save-button').addEventListener('click', () => {
    alert('内容已保存到收藏');
});

// 生成理解测试
document.getElementById('quiz-button').addEventListener('click', () => {
    window.location.href = 'quiz.html';
});