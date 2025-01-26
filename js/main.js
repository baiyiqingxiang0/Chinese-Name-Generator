// API配置
const API_KEY = "513b223d91e342a89749de9b7e449c96.WpRUlV70t5nqUSsU";
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// DOM元素
const englishNameInput = document.getElementById('englishName');
const generateBtn = document.getElementById('generateBtn');
const nameResults = document.getElementById('nameResults');

// 生成智谱AI所需的请求头
function generateHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
    };
}

// 构建姓名生成的prompt
function buildNameGenerationPrompt(englishName) {
    return [
        {
            "role": "system",
            "content": `你是一位精通中英文的文化专家和起名大师。你的任务是为外国人创建富有文化内涵的中文名字。
请严格按照以下JSON数组格式返回结果：
[
  {
    "chineseName": "中文名字",
    "pinyin": "拼音（带声调）",
    "meaning": "名字的整体寓意",
    "characters": "每个字的详细解释",
    "culturalContext": "文化背景解释",
    "personalityTraits": "名字暗含的性格特质",
    "englishExplanation": "英文解释"
  }
]
注意：
1. 基于英文名的发音特点选择音近的汉字
2. 确保名字的寓意优美、文化内涵丰富
3. 避免使用生僻字或不雅的谐音
4. 必须严格按照上述JSON格式返回，不要添加任何其他说明文字`
        },
        {
            "role": "user",
            "content": `请为英文名"${englishName}"生成3个独特的中文名字方案。`
        }
    ];
}

// 创建名字卡片的HTML
function createNameCard(nameData) {
    return `
        <div class="name-card">
            <h2 class="chinese-name">${nameData.chineseName}</h2>
            <p class="pinyin">${nameData.pinyin}</p>
            <div class="meaning">
                <h3>寓意</h3>
                <p>${nameData.meaning}</p>
            </div>
            <div class="characters">
                <h3>字义解释</h3>
                <p>${nameData.characters}</p>
            </div>
            <div class="cultural-context">
                <h3>文化背景</h3>
                <p>${nameData.culturalContext}</p>
            </div>
            <div class="personality">
                <h3>性格特质</h3>
                <p>${nameData.personalityTraits}</p>
            </div>
            <div class="english-explanation">
                <h3>English Explanation</h3>
                <p>${nameData.englishExplanation}</p>
            </div>
            <button class="favorite-btn" onclick="toggleFavorite(this)">
                ❤️ 收藏
            </button>
        </div>
    `;
}

// 调用智谱AI的API生成名字
async function generateChineseNames(englishName) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: generateHeaders(),
            body: JSON.stringify({
                model: "glm-4",
                messages: buildNameGenerationPrompt(englishName),
                temperature: 0.7,
                top_p: 0.95,
                request_id: `name_gen_${Date.now()}`
            })
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            try {
                const names = JSON.parse(content);
                if (!Array.isArray(names)) {
                    throw new Error('返回的数据不是数组格式');
                }
                return names;
            } catch (parseError) {
                console.error('解析JSON失败:', content);
                return [{
                    chineseName: "生成失败",
                    pinyin: "shēng chéng shī bài",
                    meaning: "抱歉，名字生成失败",
                    characters: "生成过程中出现错误",
                    culturalContext: "请重试",
                    personalityTraits: "N/A",
                    englishExplanation: "Generation failed, please try again"
                }];
            }
        } else {
            throw new Error('API响应格式不正确');
        }
    } catch (error) {
        console.error('生成名字时出错:', error);
        throw error;
    }
}

// 处理名字生成
async function handleNameGeneration() {
    const englishName = englishNameInput.value.trim();
    if (!englishName) {
        alert('请输入您的英文名');
        return;
    }

    try {
        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';
        nameResults.innerHTML = '<div class="loading">正在生成名字，请稍候...</div>';
        
        // 调用API生成名字
        const names = await generateChineseNames(englishName);
        
        // 清空现有结果
        nameResults.innerHTML = '';
        
        // 显示新结果
        if (names && names.length > 0) {
            names.forEach(nameData => {
                nameResults.innerHTML += createNameCard(nameData);
            });
        } else {
            nameResults.innerHTML = '<div class="error">生成名字失败，请重试</div>';
        }
    } catch (error) {
        console.error('生成名字时出错:', error);
        nameResults.innerHTML = `
            <div class="error">
                <h3>生成失败</h3>
                <p>抱歉，生成名字时出现错误。请稍后重试。</p>
                <p class="error-details">${error.message}</p>
            </div>
        `;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '生成名字';
    }
}

// 收藏功能
window.toggleFavorite = function(btn) {
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        btn.textContent = '❤️ 已收藏';
    } else {
        btn.textContent = '❤️ 收藏';
    }
}

// 添加事件监听器
generateBtn.addEventListener('click', handleNameGeneration);
englishNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleNameGeneration();
    }
}); 