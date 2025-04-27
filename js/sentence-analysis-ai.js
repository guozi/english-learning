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
    // 添加嵌套组件的样式
    const style = document.createElement('style');
    style.textContent = `
        /* 定语从句样式 */
        .component-clause {
            border: 1px dashed #666;
            border-radius: 4px;
            padding: 2px 4px;
        }
        
        /* 嵌套组件样式 */
        .component-tag .component-tag {
            margin: 2px;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }
        
        /* 提示框样式优化 */
        .component-tooltip {
            max-width: 300px;
            z-index: 100;
        }
        
        /* 嵌套组件的标签样式 */
        .component-tag .component-tag .component-label {
            font-size: 0.7em;
            padding: 1px 3px;
        }
        
        /* 增强嵌套组件的视觉区分 */
        .component-tag {
            position: relative;
            border-radius: 3px;
        }
        
        /* 定语从句内部组件样式 */
        .component-clause .component-tag {
            opacity: 0.9;
            transition: opacity 0.2s;
        }
        
        .component-clause .component-tag:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
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
    const clausesElement = document.getElementById('clause-types');
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
    
    if (tenseData && tenseData.length > 0) {
        tenseHTML += '<ul class="space-y-2">';
        tenseData.forEach(tense => {
            tenseHTML += `
                <li class="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div class="font-semibold">${tense.name}</div>
                    <div class="mt-1">${tense.explanation}</div>
                </li>
            `;
        });
    } else {
        tenseHTML = '<p>无法确定时态。</p>';
    }

    // if (tenseData) {
    //     tenseHTML = `
    //         <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
    //             <div class="font-semibold">${tenseData.name}</div>
    //             <div class="mt-1">${tenseData.explanation}</div>
    //         </div>
    //     `;
    // } else {
    //     tenseHTML = '<p>无法确定时态。</p>';
    // }
    
    // 设置时态分析HTML
    tenseElement.innerHTML = tenseHTML;
}

/**
 * 显示句子成分分析
 * @param {Array} componentsData - 成分分析数据
 * @param {string} sentence - 原始句子
 */
function displayComponents(componentsData, sentence) {
    const componentsElement = document.getElementById('sentence-components');
    const componentsPlaceholder = document.getElementById('components-placeholder');
    
    if (!componentsData || componentsData.length === 0) {
        // 如果没有成分数据，显示原始句子
        componentsElement.textContent = sentence;
        return;
    }
    
    // 隐藏占位符
    if (componentsPlaceholder) {
        componentsPlaceholder.style.display = 'none';
    }
    
    // 预处理组件数据，识别嵌套关系
    const processedData = preprocessComponents(componentsData, sentence);
    
    // 使用处理后的成分数据构建带标记的句子
    let taggedSentence = buildTaggedSentence(processedData, sentence);
    
    // 设置成分分析HTML
    componentsElement.innerHTML = taggedSentence;
    
    // 添加交互事件
    setupComponentInteractions();
}

/**
 * 预处理句子成分数据，识别嵌套关系
 * @param {Array} componentsData - 原始成分数据
 * @param {string} sentence - 原始句子
 * @returns {Array} - 处理后的成分数据
 */
/**
 * 将中文句子成分类型转换为英文类型
 * @param {string} chineseType - 中文句子成分类型
 * @returns {string} - 对应的英文类型
 */
function mapComponentTypeToEnglish(chineseType) {
    // 创建中文到英文的映射
    const typeMapping = {
        '主语': 'subject',
        '谓语': 'predicate',
        '宾语': 'object',
        '定语': 'attribute',
        '状语': 'adverbial',
        '补语': 'complement',
        '同位语': 'appositive',
        '其他': 'other'
    };
    
    // 如果是直接匹配的类型，返回映射值
    if (typeMapping[chineseType]) {
        return typeMapping[chineseType];
    }
    
    // 如果不是直接匹配，使用包含方式判断
    // 例如"第二谓语"应该返回"predicate"
    for (const [key, value] of Object.entries(typeMapping)) {
        if (chineseType.includes(key)) {
            return value;
        }
    }
    
    // 默认返回other
    return 'other';
}

function preprocessComponents(componentsData, sentence) {
    // 复制组件数据，避免修改原始数据
    const components = JSON.parse(JSON.stringify(componentsData));
    
    // 第一步：预处理组件，记录所有组件的原始位置信息
    let processedComponents = [];
    
    // 先按文本长度从长到短排序，优先处理较长的组件（通常是从句）
    components.sort((a, b) => b.text.length - a.text.length);
    
    // 记录所有组件的位置信息，但暂不替换文本
    components.forEach(component => {
        // 将中文类型转换为英文类型，而不是简单地转为小写
        const componentType = mapComponentTypeToEnglish(component.type);
        const position = sentence.indexOf(component.text);
        
        if (position !== -1) {
            // 记录组件信息
            processedComponents.push({
                text: component.text,
                type: componentType,
                explanation: component.explanation,
                position: position,
                length: component.text.length,
                children: [], // 存储嵌套的子组件
                parent: null,  // 父组件引用
                // 标记是否为定语从句
                isClause: componentType === 'attribute' && 
                    (component.text.includes('which') || component.text.includes('that') || 
                     component.text.includes('who') || component.text.includes('whom') || 
                     component.text.includes('whose'))
            });
        }
    });
    
    // 按原始位置排序
    processedComponents.sort((a, b) => a.position - b.position);
    
    // 第二步：识别嵌套关系
    // 先处理定语从句，确保从句被正确识别
    const clauseComponents = processedComponents.filter(comp => comp.isClause);
    const nonClauseComponents = processedComponents.filter(comp => !comp.isClause);
    
    // 处理定语从句的嵌套关系
    for (const clause of clauseComponents) {
        // 查找从句中的其他成分
        for (const comp of nonClauseComponents) {
            // 检查是否包含在定语从句中
            if (clause.position <= comp.position && 
                (clause.position + clause.length) >= (comp.position + comp.length) &&
                clause !== comp) {
                // 将其标记为从句的子组件
                comp.parent = clause;
                clause.children.push(comp);
            }
        }
    }
    
    // 第三步：处理其他可能的嵌套关系（非从句的嵌套）
    for (let i = 0; i < processedComponents.length; i++) {
        const current = processedComponents[i];
        
        // 跳过已经处理过的从句
        if (current.isClause) continue;
        
        for (let j = 0; j < processedComponents.length; j++) {
            if (i !== j) {
                const other = processedComponents[j];
                // 避免重复处理已有父组件的元素
                if (!other.parent && !other.isClause) {
                    // 检查是否包含在当前组件中
                    if (current.position <= other.position && 
                        (current.position + current.length) >= (other.position + other.length)) {
                        // 将其标记为当前组件的子组件
                        other.parent = current;
                        current.children.push(other);
                    }
                }
            }
        }
    }
    
    // 过滤掉已经被标记为子组件的元素，避免重复显示
    return processedComponents.filter(comp => comp.parent === null);
}

/**
 * 构建带标记的句子HTML
 * @param {Array} processedComponents - 处理后的成分数据
 * @param {string} sentence - 原始句子
 * @returns {string} - 带标记的句子HTML
 */
function buildTaggedSentence(processedComponents, sentence) {
    let taggedSentence = '';
    let lastIndex = 0;
    
    // 递归构建组件HTML
    function buildComponentHTML(component) {
        // 获取组件类名
        const componentClass = `component-tag component-${component.type}${component.isClause ? ' component-clause' : ''}`;
        
        // 如果有子组件，递归处理
        if (component.children && component.children.length > 0) {
            // 按位置排序子组件
            component.children.sort((a, b) => a.position - b.position);
            
            let innerContent = '';
            let innerLastIndex = 0;
            const componentText = component.text;
            
            // 处理每个子组件
            component.children.forEach(child => {
                // 计算子组件在父组件中的相对位置
                const relativePosition = child.position - component.position;
                
                // 添加子组件前的文本
                if (relativePosition > innerLastIndex) {
                    innerContent += componentText.substring(innerLastIndex, relativePosition);
                }
                
                // 递归构建子组件HTML
                innerContent += buildComponentHTML(child);
                
                // 更新内部索引
                innerLastIndex = relativePosition + child.length;
            });
            
            // 添加最后一个子组件后的文本
            if (innerLastIndex < componentText.length) {
                innerContent += componentText.substring(innerLastIndex);
            }
            
            // 创建带标记和提示框的HTML
            return `<span class="${componentClass}" data-component-type="${component.type}">
                <span class="component-label">${getComponentName(component.type)}</span>
                ${innerContent}
                <div class="component-tooltip" style="display: none;">${component.explanation || getComponentDescription(component.type)}</div>
            </span>`;
        } else {
            // 没有子组件，直接创建HTML
            return `<span class="${componentClass}" data-component-type="${component.type}">
                <span class="component-label">${getComponentName(component.type)}</span>
                ${component.text}
                <div class="component-tooltip" style="display: none;">${component.explanation || getComponentDescription(component.type)}</div>
            </span>`;
        }
    }
    
    // 构建最终的句子HTML
    processedComponents.forEach(comp => {
        // 添加组件前的文本
        if (comp.position > lastIndex) {
            const textBefore = sentence.substring(lastIndex, comp.position);
            taggedSentence += textBefore;
        }
        
        // 构建组件HTML
        taggedSentence += buildComponentHTML(comp);
        
        // 更新索引
        lastIndex = comp.position + comp.length;
    });
    
    // 添加句子末尾剩余的文本
    if (lastIndex < sentence.length) {
        taggedSentence += sentence.substring(lastIndex);
    }
    
    return taggedSentence;
}

/**
 * 显示短语和语法拓展分析
 * @param {Array} phrasesData - 短语分析数据
 * @param {Array} grammarPointsData - 语法点分析数据
 */
function displayPhrasesAndGrammar(phrasesData, grammarPointsData) {
    const phrasesElement = document.getElementById('key-phrases');
    const grammarElement = document.getElementById('grammar-extensions');
    
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

/**
 * 获取成分描述
 * @param {string} componentType - 成分类型
 * @returns {string} - 成分描述
 */
function getComponentDescription(componentType) {
    const componentDescriptions = {
        subject: '主语是句子的主体，表示动作的执行者或状态的承担者。',
        predicate: '谓语表示主语的动作、状态或特征，通常是动词或动词短语。',
        object: '宾语是动作的接受者，通常跟在及物动词后面。',
        attribute: '定语用来修饰、限定名词或代词，说明其特征、性质、状态等。',
        adverbial: '状语用来修饰动词、形容词或整个句子，表示时间、地点、方式、程度等。',
        complement: '补语用来补充说明主语或宾语的特征、状态等。',
        appositive: '同位语对前面的名词或代词进行解释、说明或补充。',
        other: '其他成分包括连词、冠词、感叹词等。'
    };
    
    return componentDescriptions[componentType] || '句子的组成部分';
}

/**
 * 设置句子成分的交互功能
 */
function setupComponentInteractions() {
    // 获取所有句子成分标签
    const componentTags = document.querySelectorAll('.component-tag');
    let activeTooltip = null;
    
    // 隐藏所有tooltip的辅助函数
    function hideAllTooltips() {
        document.querySelectorAll('.component-tooltip.visible').forEach(tooltip => {
            tooltip.classList.remove('visible');
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 250); // 与CSS过渡时间匹配
        });
        document.querySelectorAll('.component-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        activeTooltip = null;
    }
    
    // 隐藏特定tooltip的辅助函数
    function hideTooltip(tag) {
        const tooltip = tag.querySelector(':scope > .component-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
            tag.classList.remove('active');
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 250); // 与CSS过渡时间匹配
        }
        if (activeTooltip === tag) {
            activeTooltip = null;
        }
    }
    
    // 检查元素是否为嵌套组件的辅助函数
    function isNestedComponent(element) {
        // 检查是否在定语从句内部的嵌套组件
        return element.closest('.component-clause') && 
               element.closest('.component-clause') !== element;
    }
    
    // 为每个标签添加事件监听器
    componentTags.forEach(tag => {
        // 鼠标悬停显示提示框
        tag.addEventListener('mouseenter', function(event) {
            // 阻止事件冒泡，防止触发父组件的事件
            event.stopPropagation();
            
            // 检查是否在定语从句内部的嵌套组件
            const isNestedInClause = isNestedComponent(this);
            
            // 如果是嵌套组件，检查父组件是否已激活
            if (isNestedInClause) {
                const parentClause = this.closest('.component-clause');
                
                // 如果父组件已激活或已被点击固定，则隐藏父组件的tooltip
                if (parentClause.classList.contains('active') || 
                    parentClause.classList.contains('active-clicked')) {
                    const parentTooltip = parentClause.querySelector(':scope > .component-tooltip');
                    if (parentTooltip && parentTooltip.classList.contains('visible')) {
                        parentTooltip.classList.remove('visible');
                        setTimeout(() => {
                            parentTooltip.style.display = 'none';
                        }, 250);
                    }
                }
            }
            
            // 隐藏之前可能显示的提示框（如果不是当前组件的父组件）
            if (activeTooltip && activeTooltip !== this && 
                (!isNestedInClause || activeTooltip !== this.closest('.component-clause'))) {
                const prevTooltip = activeTooltip.querySelector(':scope > .component-tooltip');
                if (prevTooltip) {
                    prevTooltip.classList.remove('visible');
                    setTimeout(() => {
                        prevTooltip.style.display = 'none';
                    }, 250);
                }
                activeTooltip.classList.remove('active');
            }
            
            // 显示当前提示框
            const tooltip = this.querySelector(':scope > .component-tooltip');
            if (tooltip) {
                // 先设置display为block，然后添加visible类
                tooltip.style.display = 'block';
                // 使用setTimeout确保过渡效果正常工作
                setTimeout(() => {
                    tooltip.classList.add('visible');
                    this.classList.add('active');
                }, 10);
                activeTooltip = this;
                
                // 如果是定语从句，确保其内部组件的tooltip不会显示
                if (this.classList.contains('component-clause')) {
                    const nestedTags = this.querySelectorAll('.component-tag');
                    nestedTags.forEach(nestedTag => {
                        if (nestedTag !== this) {
                            const nestedTooltip = nestedTag.querySelector('.component-tooltip');
                            if (nestedTooltip) {
                                nestedTooltip.style.display = 'none';
                                nestedTooltip.classList.remove('visible');
                            }
                        }
                    });
                }
            }
        });
        
        // 鼠标离开隐藏提示框，除非已被点击固定
        tag.addEventListener('mouseleave', function(event) {
            // 阻止事件冒泡
            event.stopPropagation();
            
            // 如果没有被点击固定，则隐藏提示框
            if (!this.classList.contains('active-clicked')) {
                hideTooltip(this);
                
                // 如果是嵌套组件，检查是否需要恢复父组件的tooltip
                if (isNestedComponent(this)) {
                    const parentClause = this.closest('.component-clause');
                    if (parentClause.classList.contains('active-clicked')) {
                        const parentTooltip = parentClause.querySelector(':scope > .component-tooltip');
                        if (parentTooltip) {
                            parentTooltip.style.display = 'block';
                            setTimeout(() => {
                                parentTooltip.classList.add('visible');
                            }, 10);
                        }
                    }
                }
            }
        });
        
        // 点击固定/取消固定提示框
        tag.addEventListener('click', function(event) {
            // 阻止事件冒泡，防止触发父组件或子组件的点击事件
            event.stopPropagation();
            
            // 检查是否在定语从句内部的嵌套组件
            const isNestedInClause = isNestedComponent(this);
            
            // 如果是嵌套组件，先处理父组件的tooltip
            if (isNestedInClause) {
                const parentClause = this.closest('.component-clause');
                
                // 如果父组件已被点击固定，则取消父组件的固定状态
                if (parentClause.classList.contains('active-clicked')) {
                    parentClause.classList.remove('active-clicked');
                    const parentTooltip = parentClause.querySelector(':scope > .component-tooltip');
                    if (parentTooltip) {
                        parentTooltip.classList.remove('visible');
                        setTimeout(() => {
                            parentTooltip.style.display = 'none';
                        }, 250);
                    }
                }
            }
            
            // 切换当前组件的激活状态
            this.classList.toggle('active-clicked');
            
            // 如果取消固定，则在鼠标离开时隐藏提示框
            if (!this.classList.contains('active-clicked')) {
                hideTooltip(this);
            } else {
                // 如果是定语从句，确保其内部组件的tooltip不会显示
                if (this.classList.contains('component-clause')) {
                    const nestedTags = this.querySelectorAll('.component-tag');
                    nestedTags.forEach(nestedTag => {
                        if (nestedTag !== this) {
                            hideTooltip(nestedTag);
                            nestedTag.classList.remove('active-clicked');
                        }
                    });
                }
            }
        });
    });
    
    // 点击其他区域关闭所有固定的提示框
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.component-tag')) {
            // 关闭所有固定的提示框
            document.querySelectorAll('.component-tag.active-clicked').forEach(tag => {
                tag.classList.remove('active-clicked');
                hideTooltip(tag);
            });
        }
    });
    
    // 为定语从句添加特殊样式
    document.querySelectorAll('.component-clause').forEach(clause => {
        // 添加特殊标记
        const clauseType = clause.getAttribute('data-component-type');
        const clauseLabel = clause.querySelector('.component-label');
        if (clauseLabel) {
            clauseLabel.textContent = `${getComponentName(clauseType)}(从句)`;
        }
    });
}

// 导出函数以便在HTML中使用
window.showWordInfo = showWordInfo;
window.showComponentInfo = showComponentInfo;