import axios from 'axios';
// Vite 环境变量配置

const API_KEY = "fb6268f8c99c4022b47ba2326c748f43.cbstEn5l5WiOGoz0";
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';

if (!API_KEY) {
  throw new Error('请在.env文件中设置VITE_ZHIPUAI_API_KEY环境变量');
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

interface NameExplanation {
  characters: string[];
  meaning: string;
  origin: string;
}

interface GeneratedName {
  name: string;
  explanation: NameExplanation;
}

export async function generateName(realName: string, source: string): Promise<GeneratedName[]> {
  const prompt = `请根据${source}为${realName || '用户'}生成三个阿里巴巴风格的花名。要求：
1. 每个花名必须为2个汉字
2. 具有文化内涵和诗意
3. 易于记忆和传播
4. 避免负面含义
5. 三个花名要有各自的特色，不能重复

请按以下格式返回三个花名：
[
  {
    "name": "花名1",
    "explanation": {
      "characters": ["第一个字的解释", "第二个字的解释"],
      "meaning": "整体含义",
      "origin": "典故来源"
    }
  },
  {
    "name": "花名2",
    "explanation": {
      "characters": ["第一个字的解释", "第二个字的解释"],
      "meaning": "整体含义",
      "origin": "典故来源"
    }
  },
  {
    "name": "花名3",
    "explanation": {
      "characters": ["第一个字的解释", "第二个字的解释"],
      "meaning": "整体含义",
      "origin": "典故来源"
    }
  }
]`;

  try {
    const response = await client.post('/chat/completions', {
      model: 'glm-4',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.data.choices[0].message.content;
    const results = JSON.parse(content);

    // 验证返回的花名是否都为2个汉字
    for (const result of results) {
      if (!/^[\u4e00-\u9fa5]{2}$/.test(result.name)) {
        throw new Error('生成的花名格式不正确，请重试');
      }
    }

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('API密钥无效，请检查.env文件中的VITE_ZHIPUAI_API_KEY配置');
      }
      throw new Error(`生成花名失败: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await client.post('/audio/synthesis', {
      model: 'speech-01',
      text,
      voice_name: 'zh_female',
      audio_type: 'mp3',
    }, {
      responseType: 'arraybuffer',
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('API密钥无效，请检查.env文件中的VITE_ZHIPUAI_API_KEY配置');
      }
      throw new Error(`语音合成失败: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}