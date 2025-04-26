// 句子分析模块的JavaScript功能实现

// 示例句子数据
const exampleSentences = {
    example1: "The cat sat on the mat.", // 简单句
    example2: "I believe that he will come tomorrow if it doesn't rain.", // 复合句
    example3: "The book, which was written by a famous author, has won several awards and is now being adapted into a movie that will be released next year." // 复杂句
};

// 句子成分配置
const componentConfig = {
    subject: {
        class: 'component-subject',
        name: '主语',
        engName: 'Subject',
        description: '句子的执行者，表示"谁"或"什么"执行了动作',
        examples: ['The cat', 'She', 'John and Mary']
    },
    predicate: {
        class: 'component-predicate',
        name: '谓语',
        engName: 'Predicate',
        description: '表示主语执行的动作或处于的状态',
        examples: ['runs', 'is reading', 'will have completed']
    },
    object: {
        class: 'component-object',
        name: '宾语',
        engName: 'Object',
        description: '动作的接受者，表示动作作用的对象',
        examples: ['a book', 'the letter', 'her homework']
    },
    attribute: {
        class: 'component-attribute',
        name: '定语',
        engName: 'Attribute',
        description: '修饰名词或代词，说明其特征、性质或范围',
        examples: ['beautiful', 'my', 'which was written by him']
    },
    adverbial: {
        class: 'component-adverbial',
        name: '状语',
        engName: 'Adverbial',
        description: '修饰动词、形容词或整个句子，表示时间、地点、方式等',
        examples: ['quickly', 'in the garden', 'when it rains']
    },
    complement: {
        class: 'component-complement',
        name: '补语',
        engName: 'Complement',
        description: '补充说明主语或宾语的特征、身份或状态',
        examples: ['happy', 'a teacher', 'president of the company']
    },
    appositive: {
        class: 'component-appositive',
        name: '同位语',
        engName: 'Appositive',
        description: '对前面的名词或代词进行解释或补充说明',
        examples: ['my friend John', 'Paris, the capital of France']
    },
    other: {
        class: 'component-other',
        name: '其他',
        engName: 'Other',
        description: '包括连词、冠词、感叹词等其他成分',
        examples: ['and', 'the', 'oh']
    }
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
    
    // 添加全局点击事件，点击页面其他区域时关闭所有悬浮窗
    document.addEventListener('click', function(event) {
        // 检查点击的元素是否是组件标签或其子元素
        if (!event.target.closest('.component-tag')) {
            // 隐藏所有提示框
            document.querySelectorAll('.component-tooltip').forEach(tooltip => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px) translateX(-50%)';
                tooltip.classList.remove('visible');
                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 250);
            });
        }
    });

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
    analyzeBtn.addEventListener('click', () => {
        const sentence = sentenceInput.value.trim();
        if (sentence) {
            analyzeSentence(sentence);
            analysisResult.classList.remove('hidden');
            // 平滑滚动到结果区域
            analysisResult.scrollIntoView({ behavior: 'smooth' });
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
 * 分析句子的主函数
 * @param {string} sentence - 要分析的句子
 */
function analyzeSentence(sentence) {
    // 1. 句子结构分析
    analyzeStructure(sentence);
    
    // 2. 从句和时态分析
    analyzeClausesAndTenses(sentence);
    
    // 3. 句子成分分析
    analyzeComponents(sentence);
    
    // 4. 短语解析和语法拓展
    analyzePhrasesAndGrammar(sentence);
}

/**
 * 分析句子结构
 * @param {string} sentence - 要分析的句子
 */
function analyzeStructure(sentence) {
    const structureElement = document.getElementById('sentence-structure');
    const explanationElement = document.getElementById('structure-explanation');
    
    // 简单的句子结构分析逻辑
    // 在实际应用中，这里应该使用更复杂的NLP算法
    const words = sentence.split(' ');
    let structureHTML = '';
    
    // 为了演示，我们简单地将句子分成不同的部分
    // 并为每个部分添加可点击的交互
    words.forEach((word, index) => {
        // 清理单词（去除标点符号等）
        const cleanWord = word.replace(/[,.!?;:]$/, '');
        const punctuation = word.match(/[,.!?;:]$/)?.[0] || '';
        
        structureHTML += `<span class="sentence-part" data-index="${index}">${cleanWord}</span>${punctuation} `;
    });
    
    structureElement.innerHTML = structureHTML;
    
    // 添加句子结构的解释
    let explanation = '';
    if (sentence.includes(',') && (sentence.includes('which') || sentence.includes('that'))) {
        explanation = '这是一个<strong>复杂句</strong>，包含一个或多个从句。';
    } else if (sentence.includes('and') || sentence.includes('but') || sentence.includes('or')) {
        explanation = '这是一个<strong>复合句</strong>，由两个或多个独立分句组成。';
    } else {
        explanation = '这是一个<strong>简单句</strong>，只包含一个主谓结构。';
    }
    
    // 添加更详细的结构分析
    explanation += '<br><br><strong>句子结构分析：</strong><br>';
    
    // 根据句子类型添加不同的解释
    if (sentence === exampleSentences.example1) {
        explanation += '这个简单句由主语(The cat)、谓语动词(sat)和介词短语作状语(on the mat)组成。';
    } else if (sentence === exampleSentences.example2) {
        explanation += '这个复合句包含一个主句「I believe that...」和一个条件状语从句「if it doesn\'t rain」。主句中又包含一个宾语从句「that he will come tomorrow」。';
    } else if (sentence === exampleSentences.example3) {
        explanation += '这个复杂句包含多个从句：<br>1. 主句：The book has won several awards and is now being adapted into a movie<br>2. 定语从句：which was written by a famous author（修饰book）<br>3. 定语从句：that will be released next year（修饰movie）';
    } else {
        // 对于非示例句子，提供一个通用的分析
        explanation += '句子包含以下结构：<br>';
        if (sentence.includes(',')) {
            explanation += '- 使用了逗号分隔的结构，可能是并列成分或从句<br>';
        }
        if (sentence.includes('and') || sentence.includes('but') || sentence.includes('or')) {
            explanation += '- 使用了连词连接的并列结构<br>';
        }
        if (sentence.includes('which') || sentence.includes('that') || sentence.includes('who')) {
            explanation += '- 包含定语从句<br>';
        }
        if (sentence.includes('when') || sentence.includes('while') || sentence.includes('after') || sentence.includes('before')) {
            explanation += '- 包含时间状语从句<br>';
        }
        if (sentence.includes('if') || sentence.includes('unless')) {
            explanation += '- 包含条件状语从句<br>';
        }
    }
    
    explanationElement.innerHTML = explanation;
    
    // 为句子部分添加点击事件
    document.querySelectorAll('.sentence-part').forEach(part => {
        part.addEventListener('click', () => {
            // 移除所有活跃状态
            document.querySelectorAll('.sentence-part').forEach(p => p.classList.remove('active'));
            // 添加活跃状态到当前部分
            part.classList.add('active');
            
            // 这里可以添加更详细的单词分析逻辑
            const wordIndex = parseInt(part.dataset.index);
            const word = words[wordIndex].replace(/[,.!?;:]$/, '');
            
            // 简单的词性判断逻辑（实际应用中应使用NLP库）
            let wordType = '未知';
            if (['a', 'an', 'the'].includes(word.toLowerCase())) {
                wordType = '冠词';
            } else if (['in', 'on', 'at', 'by', 'with', 'from', 'to', 'for'].includes(word.toLowerCase())) {
                wordType = '介词';
            } else if (['and', 'but', 'or', 'so', 'yet', 'for', 'nor'].includes(word.toLowerCase())) {
                wordType = '连词';
            } else if (['I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'].includes(word)) {
                wordType = '代词';
            }
            
            // 显示单词分析
            const wordInfo = `<div class="mt-3 p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                <p class="font-bold">单词分析: "${word}"</p>
                <p>可能的词性: ${wordType}</p>
            </div>`;
            
            // 将单词分析添加到解释元素的末尾
            const currentExplanation = explanationElement.innerHTML;
            explanationElement.innerHTML = currentExplanation.split('<div class="mt-3')[0] + wordInfo;
        });
    });
}

/**
 * 分析从句和时态
 * @param {string} sentence - 要分析的句子
 */
function analyzeClausesAndTenses(sentence) {
    const clauseTypesElement = document.getElementById('clause-types');
    const tenseAnalysisElement = document.getElementById('tense-analysis');
    
    // 从句分析
    let clauseTypes = '';
    
    // 简单的从句检测逻辑
    if (sentence.includes('that ')) {
        clauseTypes += '<li><span class="font-semibold">宾语从句</span>: 使用 "that" 引导</li>';
    }
    if (sentence.includes('which ') || sentence.includes('that ') || sentence.includes('who ')) {
        clauseTypes += '<li><span class="font-semibold">定语从句</span>: 使用关系代词 "which/that/who" 引导</li>';
    }
    if (sentence.includes('when ') || sentence.includes('while ') || sentence.includes('after ') || sentence.includes('before ')) {
        clauseTypes += '<li><span class="font-semibold">时间状语从句</span>: 使用 "when/while/after/before" 引导</li>';
    }
    if (sentence.includes('if ') || sentence.includes('unless ')) {
        clauseTypes += '<li><span class="font-semibold">条件状语从句</span>: 使用 "if/unless" 引导</li>';
    }
    if (sentence.includes('because ') || sentence.includes('since ') || sentence.includes('as ')) {
        clauseTypes += '<li><span class="font-semibold">原因状语从句</span>: 使用 "because/since/as" 引导</li>';
    }
    
    // 如果没有检测到从句，显示相应信息
    if (!clauseTypes) {
        clauseTypes = '<li>未检测到明显的从句结构</li>';
    }
    
    clauseTypesElement.innerHTML = clauseTypes;
    
    // 时态分析
    let tenseAnalysis = '';
    
    // 简单的时态检测逻辑
    if (sentence.includes(' will ')) {
        tenseAnalysis += '<li><span class="font-semibold">一般将来时</span>: 使用 "will + 动词原形"</li>';
    }
    if (sentence.includes(' is ') || sentence.includes(' am ') || sentence.includes(' are ')) {
        if (sentence.includes(' being ')) {
            tenseAnalysis += '<li><span class="font-semibold">现在进行时</span>: 使用 "is/am/are + being + 过去分词"</li>';
        } else if (sentence.includes(' been ')) {
            tenseAnalysis += '<li><span class="font-semibold">现在完成时</span>: 使用 "has/have + been + 过去分词"</li>';
        } else {
            tenseAnalysis += '<li><span class="font-semibold">一般现在时</span>: 使用 "is/am/are + 动词原形"</li>';
        }
    }
    if (sentence.includes(' was ') || sentence.includes(' were ')) {
        if (sentence.includes(' been ')) {
            tenseAnalysis += '<li><span class="font-semibold">过去完成时</span>: 使用 "had + been + 过去分词"</li>';
        } else if (sentence.includes(' being ')) {
            tenseAnalysis += '<li><span class="font-semibold">过去进行时</span>: 使用 "was/were + being + 过去分词"</li>';
        } else {
            tenseAnalysis += '<li><span class="font-semibold">一般过去时</span>: 使用 "was/were + 动词原形"</li>';
        }
    }
    if (sentence.includes(' has ') || sentence.includes(' have ') || sentence.includes(' had ')) {
        if (sentence.includes(' been ')) {
            if (sentence.includes(' will have been ')) {
                tenseAnalysis += '<li><span class="font-semibold">将来完成时</span>: 使用 "will have been + 过去分词"</li>';
            } else {
                tenseAnalysis += '<li><span class="font-semibold">完成时</span>: 使用 "has/have/had + been + 过去分词"</li>';
            }
        } else {
            tenseAnalysis += '<li><span class="font-semibold">完成时</span>: 使用 "has/have/had + 过去分词"</li>';
        }
    }
    
    // 如果没有检测到明显的时态，显示相应信息
    if (!tenseAnalysis) {
        tenseAnalysis = '<li>未检测到明显的时态标记，可能是一般现在时或一般过去时</li>';
    }
    
    tenseAnalysisElement.innerHTML = tenseAnalysis;
}

/**
 * 分析句子成分
 * @param {string} sentence - 要分析的句子
 */
function analyzeComponents(sentence) {
    const componentsElement = document.getElementById('sentence-components');
    const placeholderElement = document.getElementById('components-placeholder');
    
    // 隐藏占位符
    if (sentence && placeholderElement) {
        placeholderElement.style.display = 'none';
    }
    
    // 在实际应用中，这里应该使用NLP库进行更准确的句法分析
    // 这里我们使用一个简化的演示版本
    
    let componentsHTML = '';
    
    // 创建句子成分标签的函数
    function createComponentTag(text, type, isNested = false) {
        const config = componentConfig[type];
        const nestedClass = isNested ? 'ml-2 mr-2 my-1' : '';
        
        // 根据组件类型设置对应的背景颜色类
        let tooltipBgClass = '';
        
        // 为每种组件类型设置对应的背景颜色
        switch(type) {
            case 'subject':
                tooltipBgClass = 'bg-blue-100 dark:bg-blue-900';
                break;
            case 'predicate':
                tooltipBgClass = 'bg-red-100 dark:bg-red-900';
                break;
            case 'object':
                tooltipBgClass = 'bg-green-100 dark:bg-green-900';
                break;
            case 'attribute':
                tooltipBgClass = 'bg-yellow-100 dark:bg-yellow-900';
                break;
            case 'adverbial':
                tooltipBgClass = 'bg-purple-100 dark:bg-purple-900';
                break;
            case 'complement':
                tooltipBgClass = 'bg-pink-100 dark:bg-pink-900';
                break;
            case 'appositive':
                tooltipBgClass = 'bg-indigo-100 dark:bg-indigo-900';
                break;
            case 'other':
                tooltipBgClass = 'bg-gray-100 dark:bg-gray-900';
                break;
            default:
                tooltipBgClass = 'bg-white dark:bg-gray-800';
        }
        
        // 为组件标签添加一个额外的类，用于嵌套组件的样式区分
        // 但保持悬浮窗的颜色与组件类型一致
        const tagClass = isNested ? `${config.class} nested-component` : config.class;
        
        return `
            <span class="component-tag ${tagClass} ${nestedClass}" data-type="${type}">
                <span class="component-label">${config.name}</span>
                <div class="component-tooltip ${tooltipBgClass} shadow-lg rounded-lg ${config.class}-tooltip" style="display: none;">
                    <div class="font-bold mb-1">${config.name} (${config.engName})</div>
                    <div class="text-xs mb-2">${config.description}</div>
                    <div class="text-xs italic">例如: ${config.examples.join(', ')}</div>
                </div>
                ${text}
            </span>
        `;
    }
    
    // 根据示例句子提供预设的分析
    if (sentence === exampleSentences.example1) {
        // 简单句分析
        componentsHTML = `
            ${createComponentTag('The cat', 'subject')}
            ${createComponentTag('sat', 'predicate')}
            ${createComponentTag('on the mat', 'adverbial')}
            .
        `;
    } else if (sentence === exampleSentences.example2) {
        // 复合句分析
        const objectContent = `
            that 
            ${createComponentTag('he', 'subject', true)}
            ${createComponentTag('will come', 'predicate', true)}
            ${createComponentTag('tomorrow', 'adverbial', true)}
            ${createComponentTag(`if 
                ${createComponentTag('it', 'subject', true)}
                ${createComponentTag('doesn\'t rain', 'predicate', true)}
            `, 'adverbial', true)}
        `;
        
        componentsHTML = `
            ${createComponentTag('I', 'subject')}
            ${createComponentTag('believe', 'predicate')}
            ${createComponentTag(objectContent, 'object')}
            .
        `;
    } else if (sentence === exampleSentences.example3) {
        // 复杂句分析
        const attributeContent1 = `
            which 
            ${createComponentTag('was written', 'predicate', true)}
            ${createComponentTag('by a famous author', 'adverbial', true)}
        `;
        
        const attributeContent2 = `
            that 
            ${createComponentTag('will be released', 'predicate', true)}
            ${createComponentTag('next year', 'adverbial', true)}
        `;
        
        componentsHTML = `
            ${createComponentTag('The book', 'subject')},
            ${createComponentTag(attributeContent1, 'attribute')},
            ${createComponentTag('has won', 'predicate')}
            ${createComponentTag('several awards', 'object')}
            and
            ${createComponentTag('is now being adapted', 'predicate')}
            ${createComponentTag('into a movie', 'adverbial')}
            ${createComponentTag(attributeContent2, 'attribute')}
            .
        `;
    } else {
        // 对于非示例句子，提供一个简化的分析
        // 在实际应用中，这里应该使用NLP库
        const words = sentence.split(' ');
        let inSubject = true; // 假设句子以主语开始
        
        words.forEach((word, index) => {
            // 清理单词（去除标点符号等）
            const cleanWord = word.replace(/[,.!?;:]$/, '');
            const punctuation = word.match(/[,.!?;:]$/)?.[0] || '';
            
            // 非常简化的句法分析逻辑
            let componentType = '';
            
            if (index === 0 || (index === 1 && ['a', 'an', 'the'].includes(words[0].toLowerCase()))) {
                // 假设句子开头是主语
                componentType = 'subject';
            } else if (['is', 'am', 'are', 'was', 'were', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'may', 'might', 'shall', 'should', 'must'].includes(cleanWord.toLowerCase()) || 
                      (index > 0 && ['is', 'am', 'are', 'was', 'were', 'has', 'have', 'had', 'will', 'would', 'can', 'could', 'may', 'might', 'shall', 'should', 'must'].includes(words[index-1].toLowerCase()))) {
                // 假设这些是谓语动词或其一部分
                componentType = 'predicate';
                inSubject = false;
            } else if (['in', 'on', 'at', 'by', 'with', 'from', 'to', 'for', 'before', 'after', 'during', 'until'].includes(cleanWord.toLowerCase())) {
                // 假设这些介词引导状语
                componentType = 'adverbial';
            } else if (['a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'].includes(cleanWord.toLowerCase())) {
                // 假设这些是定语
                componentType = 'attribute';
            } else if (!inSubject && index > 2) {
                // 假设主语和谓语之后的名词短语是宾语
                componentType = 'object';
            } else {
                // 其他情况
                componentType = 'other';
            }
            
            componentsHTML += createComponentTag(cleanWord, componentType, false) + punctuation + ' ';
        });
    }
    
    componentsElement.innerHTML = componentsHTML;
    
    // 添加点击和悬停事件处理
    document.querySelectorAll('.component-tag').forEach(tag => {
        // 点击事件处理
        tag.addEventListener('click', function() {
            // 移除所有活跃状态
            document.querySelectorAll('.component-tag').forEach(t => t.classList.remove('active'));
            // 添加活跃状态到当前标签
            this.classList.add('active');
            
            // 可以在这里添加更多交互逻辑，例如显示详细信息面板等
        });
        
        // 悬停事件处理 - 显示提示框
        tag.addEventListener('mouseenter', function() {
            // 先隐藏所有提示框
            document.querySelectorAll('.component-tooltip').forEach(tooltip => {
                tooltip.style.display = 'none';
                tooltip.classList.remove('visible');
            });
            
            // 显示当前标签的提示框
            const tooltip = this.querySelector('.component-tooltip');
            if (tooltip) {
                // 设置过渡效果 - 优化动画效果
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px) translateX(-50%)';
                tooltip.style.display = 'block';
                
                // 使用延迟显示提示框，提供平滑过渡
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateY(0) translateX(-50%)';
                    tooltip.classList.add('visible');
                }, 30);
            }
        });
        
        // 鼠标离开事件处理 - 隐藏提示框
        tag.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.component-tooltip');
            if (tooltip) {
                // 优化隐藏动画
                tooltip.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px) translateX(-50%)';
                tooltip.classList.remove('visible');
                
                // 延迟隐藏，以便过渡效果完成
                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 250);
            }
        });
        
        // 点击事件也要隐藏所有提示框，避免多个提示框同时显示
        tag.addEventListener('click', function() {
            // 隐藏所有提示框
            document.querySelectorAll('.component-tooltip').forEach(tooltip => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px) translateX(-50%)';
                tooltip.classList.remove('visible');
                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 250);
            });
        });
    });
    
    // 不再需要调整组件标签布局
}

// 不再需要adjustComponentTagsLayout函数
// 移除了连接线相关代码和标签重叠处理

/**
 * 分析短语和语法
 * @param {string} sentence - 要分析的句子
 */
function analyzePhrasesAndGrammar(sentence) {
    const keyPhrasesElement = document.getElementById('key-phrases');
    const grammarExtensionsElement = document.getElementById('grammar-extensions');
    
    // 关键短语分析
    let keyPhrases = '';
    
    // 简单的短语检测逻辑
    const phrasePatterns = [
        { pattern: /([a-z]+) (on|in|at|by|with|from|to) ([a-z]+)/gi, type: '介词短语' },
        { pattern: /(a|an|the) ([a-z]+)/gi, type: '名词短语' },
        { pattern: /(will|would|can|could|may|might|shall|should|must) ([a-z]+)/gi, type: '情态动词短语' },
        { pattern: /(has|have|had) (been) ([a-z]+)/gi, type: '完成时短语' },
        { pattern: /(is|am|are|was|were) ([a-z]+ing)/gi, type: '进行时短语' }
    ];
    
    // 检测短语
    phrasePatterns.forEach(({ pattern, type }) => {
        const matches = [...sentence.matchAll(pattern)];
        matches.forEach(match => {
            keyPhrases += `
                <li class="mb-2">
                    <div class="font-semibold">${match[0]}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${type}</div>
                </li>
            `;
        });
    });
    
    // 如果没有检测到短语，显示相应信息
    if (!keyPhrases) {
        keyPhrases = '<li>未检测到明显的关键短语</li>';
    }
    
    keyPhrasesElement.innerHTML = keyPhrases;
    
    // 语法拓展
    let grammarExtensions = '';
    
    // 根据示例句子提供预设的语法拓展
    if (sentence === exampleSentences.example1) {
        grammarExtensions = `
            <div class="mb-3">
                <h4 class="font-semibold mb-1">介词短语作状语</h4>
                <p>"on the mat" 是介词短语，在句中作状语，表示动作发生的位置。</p>
            </div>
            <div>
                <h4 class="font-semibold mb-1">相关语法拓展</h4>
                <p>可以尝试使用其他介词短语替换 "on the mat"，如 "under the table"、"beside the window" 等，表达不同的位置关系。</p>
            </div>
        `;
    } else if (sentence === exampleSentences.example2) {
        grammarExtensions = `
            <div class="mb-3">
                <h4 class="font-semibold mb-1">宾语从句</h4>
                <p>"that he will come tomorrow" 是宾语从句，作动词 "believe" 的宾语。</p>
            </div>
            <div class="mb-3">
                <h4 class="font-semibold mb-1">条件状语从句</h4>
                <p>"if it doesn't rain" 是条件状语从句，表示动作发生的条件。</p>
            </div>
            <div>
                <h4 class="font-semibold mb-1">相关语法拓展</h4>
                <p>可以尝试使用其他连词替换 "if"，如 "unless"、"provided that" 等，表达不同的条件关系。</p>
            </div>
        `;
    } else if (sentence === exampleSentences.example3) {
        grammarExtensions = `
            <div class="mb-3">
                <h4 class="font-semibold mb-1">非限制性定语从句</h4>
                <p>"which was written by a famous author" 是非限制性定语从句，修饰 "The book"，提供额外信息。</p>
            </div>
            <div class="mb-3">
                <h4 class="font-semibold mb-1">限制性定语从句</h4>
                <p>"that will be released next year" 是限制性定语从句，修饰 "a movie"，提供必要信息。</p>
            </div>
            <div>
                <h4 class="font-semibold mb-1">相关语法拓展</h4>
                <p>注意非限制性定语从句使用逗号隔开，通常用 "which" 引导；而限制性定语从句不用逗号隔开，可以用 "that" 或 "which" 引导。</p>
            </div>
        `;
    } else {
        // 对于非示例句子，提供一个通用的语法拓展
        grammarExtensions = `
            <div class="mb-3">
                <h4 class="font-semibold mb-1">句子结构拓展</h4>
                <p>尝试扩展这个句子，可以：</p>
                <ul class="list-disc list-inside mt-1 space-y-1">
                    <li>添加形容词或副词修饰语</li>
                    <li>使用并列结构增加信息量</li>
                    <li>添加从句提供更多细节</li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold mb-1">语法练习建议</h4>
                <p>尝试改写这个句子，使用不同的时态或语态，观察句子结构的变化。</p>
            </div>
        `;
    }
    
    grammarExtensionsElement.innerHTML = grammarExtensions;
}