// 句子分析模块的JavaScript功能实现 - AI增强版
// 导入AI服务
import aiService from './ai-service.js';
import { API_CONFIG } from './api-config.js';

// 示例句子数据
const exampleSentences = {
    example1: "The cat sat on the mat.", // 简单句
    example2: "I believe that he will come tomorrow if it doesn't rain.", // 复合句
    example3: "The book, which was written by a famous author, has won several awards and is now being adapted into a movie that will be released next year." // 复杂句
};

// 句子成分颜色映射
const componentColors = {
    subject: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', // 主语
    predicate: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', // 谓语
    object: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', // 宾语
    attribute: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', // 定语
    adverbial: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', // 状语
    complement: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', // 补语
    appositive: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', // 同位语
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' // 其他
};

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const sentenceInput = document.getElementById('sentence-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analysisResult = document.getElementById('analysis-result');
    const exampleBtn1 = document.getElementById('example-btn-1');
    const exampleBtn2 = document.getElementById('example-btn-2');
    const exampleBtn3 = document.getElementById('example-btn-3');
    const loadingIndicator = document.getElementById('loading-indicator'); // 确保HTML中添加了这个元素

    // 绑定示例按钮事件
    exampleBtn1.addEventListener('click', () => {
        sentenceInput.value = exampleSentences.example1;
    });

    exampleBtn2.addEventListener('click', () => {
        sentenceInput.value = exampleSentences.example2;
    });

    exampleBtn3.addEventListener('click', () => {
        sentenceInput.value = exampleSentences.example3;
    });

    // 绑定分析按钮事件
    analyzeBtn.addEventListener('click', async () => {
        const sentence = sentenceInput.value.trim();
        if (sentence) {
            try {
                // 显示加载状态
                if (loadingIndicator) {
                    loadingIndicator.classList.remove('hidden');
                }
                analyzeBtn.disabled = true;
                analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>分析中...';
                
                // 使用AI服务分析句子
                const analysisData = await aiService.analyzeSentence(sentence);
                
                // 使用AI返回的数据更新UI
                displayAnalysisResults(analysisData, sentence);
                
                analysisResult.classList.remove('hidden');
                // 平滑滚动到结果区域
                analysisResult.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error('句子分析失败:', error);
                alert(`句子分析失败: ${error.message}`);
            } finally {
                // 恢复按钮状态
                if (loadingIndicator) {
                    loadingIndicator.classList.add('hidden');
                }
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '分析句子';
            }
        } else {
            alert('请输入句子后再进行分析');
        }
    });

    // 为了演示，也可以按回车键分析
    sentenceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeBtn.click();
        }
    });
});

/**
 * 显示分析结果的主函数
 * @param {Object} analysisData - AI返回的分析数据
 * @param {string} sentence - 原始句子
 */
function displayAnalysisResults(analysisData, sentence) {
    // 1. 句子结构分析
    displayStructureAnalysis(analysisData.structure, sentence);
    
    // 2. 从句和时态分析
    displayClausesAndTenses(analysisData.clauses, analysisData.tense);
    
    // 3. 句子成分分析
    displayComponents(analysisData.components, sentence);
    
    // 4. 短语解析和语法拓展
    displayPhrasesAndGrammar(analysisData.phrases, analysisData.grammarPoints);
}

/**
 * 显示句子结构分析
 * @param {Object} structureData - 结构分析数据
 * @param {string} sentence - 原始句子
 */
function displayStructureAnalysis(structureData, sentence) {
    const structureElement = document.getElementById('sentence-structure');
    const explanationElement = document.getElementById('structure-explanation');
    
    if (!structureData) {
        // 如果没有结构数据，显示简单分析
        const words = sentence.split(' ');
        let structureHTML = '';
        
        words.forEach((word, index) => {
            const cleanWord = word.replace(/[.,!?;:"'()\[\]{}]/g, '');
            
            if (cleanWord) {
                structureHTML += `<span class="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900 px-1 rounded" 
                                     data-word="${cleanWord}" 
                                     onclick="showWordInfo(this)">
                                  ${word}
                               </span> `;
            } else {
                structureHTML += `${word} `;
            }
        });
        
        structureElement.innerHTML = structureHTML;
        explanationElement.textContent = '无法获取详细结构分析。';
        return;
    }
    
    // 设置结构分析HTML - 使用高亮显示句子结构
    structureElement.innerHTML = sentence;
    
    // 设置解释文本
    explanationElement.innerHTML = `
        <div class="mb-2"><span class="font-semibold">句子类型:</span> ${structureData.type}</div>
        <div><span class="font-semibold">结构解释:</span> ${structureData.explanation}</div>
    `;
}

/**
 * 显示从句和时态分析
 * @param {Array} clausesData - 从句分析数据
 * @param {Object} tenseData - 时态分析数据
 */
function displayClausesAndTenses(clausesData, tenseData) {
    const clausesElement = document.getElementById('clauses-analysis');
    const tenseElement = document.getElementById('tense-analysis');
    
    // 生成从句分析HTML
    let clausesHTML = '';
    
    if (clausesData && clausesData.length > 0) {
        clausesHTML += '<ul class="space-y-2">';
        clausesData.forEach(clause => {
            clausesHTML += `
                <li class="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div class="font-semibold">${clause.type}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">功能: ${clause.function}</div>
                    <div class="mt-1 italic">"${clause.text}"</div>
                </li>
            `;
        });
        clausesHTML += '</ul>';
    } else {
        clausesHTML = '<p>未检测到从句结构。</p>';
    }
    
    // 设置从句分析HTML
    clausesElement.innerHTML = clausesHTML;
    
    // 设置时态分析HTML
    let tenseHTML = '';
    
    if (tenseData) {
        tenseHTML = `
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div class="font-semibold">${tenseData.name}</div>
                <div class="mt-1">${tenseData.explanation}</div>
            </div>
        `;
    } else {
        tenseHTML = '<p>无法确定时态。</p>';
    }
    
    // 设置时态分析HTML
    tenseElement.innerHTML = tenseHTML;
}

/**
 * 显示句子成分分析
 * @param {Array} componentsData - 成分分析数据
 * @param {string} sentence - 原始句子
 */
function displayComponents(componentsData, sentence) {
    const componentsElement = document.getElementById('components-analysis');
    
    if (!componentsData || componentsData.length === 0) {
        // 如果没有成分数据，显示原始句子
        componentsElement.textContent = sentence;
        return;
    }
    
    // 使用AI返回的成分数据构建带标记的句子
    let taggedSentence = sentence;
    
    // 从后向前替换，避免位置偏移问题
    componentsData.sort((a, b) => {
        // 如果text是句子的一部分，计算它在句子中的位置
        const posA = sentence.indexOf(a.text);
        const posB = sentence.indexOf(b.text);
        return posB - posA; // 从后向前排序
    });
    
    componentsData.forEach(component => {
        if (sentence.includes(component.text)) {
            const componentType = component.type.toLowerCase();
            // 确定使用哪种颜色类
            const colorClass = componentColors[componentType] || componentColors.other;
            
            // 创建带标记的HTML
            const taggedComponent = `<span class="${colorClass} px-1 rounded cursor-pointer" 
                                        title="${component.explanation}"
                                        onclick="showComponentInfo(this, '${componentType}')">
                                     ${component.text}
                                  </span>`;
            
            // 替换原始文本
            taggedSentence = taggedSentence.replace(component.text, taggedComponent);
        }
    });
    
    // 设置成分分析HTML
    componentsElement.innerHTML = taggedSentence;
}

/**
 * 显示短语和语法拓展分析
 * @param {Array} phrasesData - 短语分析数据
 * @param {Array} grammarPointsData - 语法点分析数据
 */
function displayPhrasesAndGrammar(phrasesData, grammarPointsData) {
    const phrasesElement = document.getElementById('phrases-analysis');
    const grammarElement = document.getElementById('grammar-points');
    
    // 生成短语分析HTML
    let phrasesHTML = '';
    
    if (phrasesData && phrasesData.length > 0) {
        phrasesHTML += '<ul class="space-y-2">';
        phrasesData.forEach(phrase => {
            phrasesHTML += `
                <li class="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div class="font-semibold">${phrase.type}</div>
                    <div class="mt-1 italic">"${phrase.text}"</div>
                    <div class="mt-1 text-sm">${phrase.explanation}</div>
                </li>
            `;
        });
        phrasesHTML += '</ul>';
    } else {
        phrasesHTML = '<p>未检测到特殊短语结构。</p>';
    }
    
    // 设置短语分析HTML
    phrasesElement.innerHTML = phrasesHTML;
    
    // 生成语法点HTML
    let grammarHTML = '';
    
    if (grammarPointsData && grammarPointsData.length > 0) {
        grammarHTML += '<ul class="space-y-2">';
        grammarPointsData.forEach(point => {
            grammarHTML += `
                <li class="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div class="font-semibold">${point.point}</div>
                    <div class="mt-1">${point.explanation}</div>
                </li>
            `;
        });
        grammarHTML += '</ul>';
    } else {
        grammarHTML = '<p>未检测到特殊语法点。</p>';
    }
    
    // 设置语法点HTML
    grammarElement.innerHTML = grammarHTML;
}

/**
 * 显示单词信息
 * @param {HTMLElement} element - 单词元素
 */
function showWordInfo(element) {
    const word = element.dataset.word;
    alert(`您点击了单词: ${word}\n这里可以显示单词的详细信息，如词性、释义等。`);
}

/**
 * 显示句子成分信息
 * @param {HTMLElement} element - 成分元素
 * @param {string} componentType - 成分类型
 */
function showComponentInfo(element, componentType) {
    const componentName = getComponentName(componentType);
    alert(`这是句子的${componentName}\n${element.title || ''}`);
}

/**
 * 获取成分名称
 * @param {string} componentType - 成分类型
 * @returns {string} - 成分中文名称
 */
function getComponentName(componentType) {
    const componentNames = {
        subject: '主语',
        predicate: '谓语',
        object: '宾语',
        attribute: '定语',
        adverbial: '状语',
        complement: '补语',
        appositive: '同位语',
        other: '其他成分'
    };
    
    return componentNames[componentType] || '未知成分';
}

// 导出函数以便在HTML中使用
window.showWordInfo = showWordInfo;
window.showComponentInfo = showComponentInfo;