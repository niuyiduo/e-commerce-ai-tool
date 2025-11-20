/**
 * 火山引擎 AI 客户端封装
 * 使用豆包模型进行商品素材生成
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GenerateOptions {
  message: string;
  productImage?: string;
  history?: ChatMessage[];
  materialType?: 'title' | 'selling-points' | 'atmosphere' | 'video-script';
  model?: string; // 添加模型参数
}

/**
 * 生成素材的系统提示词
 */
const SYSTEM_PROMPTS = {
  title: `你是一个专业的电商文案专家。请根据用户上传的商品图片和描述，生成吸引人的商品标题。
要求：
1. 标题长度在 10-30 个字之间
2. 包含商品核心卖点
3. 语言简洁有力，吸引眼球
4. 符合电商平台规范`,

  'selling-points': `你是一个专业的电商文案专家。请根据商品信息，生成多组商品卖点。
要求：
1. 每组卖点为短语，不超过 15 个字
2. 生成 3-5 组卖点
3. 突出商品优势和特色
4. 使用 emoji 增强视觉效果`,

  atmosphere: `你是一个专业的电商视觉设计师。请根据商品图片，生成适合贴在主图四周的氛围图文案。
要求：
1. 文案简短有力，不超过 10 个字
2. 符合商品调性
3. 能够烘托购物氛围`,

  'video-script': `你是一个专业的短视频脚本创作者。请根据商品信息，生成 3-10 秒的讲解视频脚本。
要求：
1. 包含开场、展示、卖点、结尾四个部分
2. 语言口语化，适合主播讲解
3. 突出商品核心价值
4. 总时长控制在 3-10 秒`,

  default: `你是一个专业的电商运营助手，擅长生成各类商品营销素材。
请根据用户的需求，生成高质量的商品文案。`,
};

/**
 * 调用火山引擎 API 生成内容
 */
export async function generateWithVolcengine(options: GenerateOptions): Promise<string> {
  const { message, productImage, history = [], materialType, model } = options;

  try {
    // 构建系统提示词
    const systemPrompt = materialType 
      ? SYSTEM_PROMPTS[materialType] 
      : SYSTEM_PROMPTS.default;

    // 构建消息历史
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    // 调用火山引擎 API
    const defaultEndpoint = process.env.VOLCENGINE_ENDPOINT_ID;
    const apiKey = process.env.VOLCENGINE_API_KEY;
    
    // 模型名称到 endpoint ID 的映射
    const modelEndpointMap: Record<string, string | undefined> = {
      'Doubao-1.5-pro-32k': process.env.VOLCENGINE_ENDPOINT_PRO_32K || defaultEndpoint,
      'Doubao-1.5-pro-4k': process.env.VOLCENGINE_ENDPOINT_PRO_4K || defaultEndpoint,
      'Doubao-lite-32k': process.env.VOLCENGINE_ENDPOINT_LITE_32K || defaultEndpoint,
      'Doubao-lite-4k': process.env.VOLCENGINE_ENDPOINT_LITE_4K || defaultEndpoint,
    };
    
    // 根据选择的模型获取对应的 endpoint，如果没有指定模型则使用默认 endpoint
    const modelEndpoint = model && modelEndpointMap[model] ? modelEndpointMap[model] : defaultEndpoint;
    
    if (!modelEndpoint) {
      throw new Error('未配置模型 endpoint，请检查环境变量');
    }
    
    console.log(`🤖 使用模型: ${model || '默认'}, Endpoint: ${modelEndpoint}`);
    
    const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelEndpoint, // 使用映射后的 endpoint
        messages: messages,
        temperature: 0.8,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '生成失败，请重试';

  } catch (error) {
    console.error('火山引擎 API 调用失败:', error);
    throw error;
  }
}

/**
 * 流式生成（用于实时打字效果）
 */
export async function generateStreamWithVolcengine(
  options: GenerateOptions,
  onChunk: (text: string) => void
): Promise<void> {
  const { message, history = [], materialType } = options;

  try {
    const systemPrompt = materialType 
      ? SYSTEM_PROMPTS[materialType] 
      : SYSTEM_PROMPTS.default;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    const endpoint = process.env.VOLCENGINE_ENDPOINT_ID;
    const apiKey = process.env.VOLCENGINE_API_KEY;

    const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: endpoint,
        messages: messages,
        temperature: 0.8,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error('解析流数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('流式生成失败:', error);
    throw error;
  }
}
