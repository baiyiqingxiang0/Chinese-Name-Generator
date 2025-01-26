// API配置
const API_KEY = "513b223d91e342a89749de9b7e449c96.WpRUlV70t5nqUSsU";
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

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
请遵循以下规则：
1. 基于英文名的发音特点选择音近的汉字
2. 确保名字的寓意优美、文化内涵丰富
3. 避免使用生僻字或不雅的谐音
4. 每个推荐名字都需要提供详细的解释
5. 输出格式必须是JSON格式，包含以下字段：
   - chineseName: 中文名字
   - pinyin: 拼音（带声调）
   - meaning: 名字的整体寓意
   - characters: 每个字的详细解释
   - culturalContext: 文化背景解释
   - personalityTraits: 名字暗含的性格特质
   - englishExplanation: 英文解释`
        },
        {
            "role": "user",
            "content": `请为英文名"${englishName}"生成3个独特的中文名字方案，确保音韵和谐、寓意优美。请用JSON数组格式返回结果。`
        }
    ];
}

// 调用智谱AI的API生成名字
async function generateChineseNames(englishName) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: generateHeaders(),
            body: JSON.stringify({
                model: "glm-4-plus",
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
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        console.error('生成名字时出错:', error);
        throw error;
    }
}

// 导出API函数
export { generateChineseNames }; 