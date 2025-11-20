import { NextRequest, NextResponse } from 'next/server';
import { generateWithVolcengine } from '@/lib/ai/volcengine';

// 判断素材类型
function detectMaterialType(message: string): 'title' | 'selling-points' | 'atmosphere' | 'video-script' | undefined {
  if (message.includes('标题')) return 'title';
  if (message.includes('卖点')) return 'selling-points';
  if (message.includes('氛围图')) return 'atmosphere';
  if (message.includes('视频') || message.includes('脚本')) return 'video-script';
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { message, productImage, history, model } = await request.json();

    // 检查环境变量
    const hasApiKey = process.env.VOLCENGINE_API_KEY && process.env.VOLCENGINE_ENDPOINT_ID;

    if (!hasApiKey) {
      // 如果没有配置 API Key，返回模拟数据
      const mockResponses: Record<string, string> = {
        '生成商品标题': '东方甄选自营雪莲果脆爽清甜水润多汁新鲜水果坏果包赔',
        '生成商品卖点': '✨ 清甜脆嫩多汁、超 200 项检测\n✨ 产地直发、新鲜直达\n✨ 坏果包赔、品质保证',
        '生成氛围图文案': '美好生活，尽在东方甄选',
        '生成视频脚本': `【开场】大家好，今天给大家带来东方甄选的雪莲果！
【展示】看这饱满的果实，清脆爽口
【卖点】超过200项检测，品质有保障
【结尾】点击下方链接，新鲜直达您家！`,
      };

      const response = mockResponses[message] || '🤖 请先配置火山引擎 API 密钥，当前为模拟模式。\n\n请在 .env.local 文件中配置：\nVOLCENGINE_API_KEY=您的API密钥\nVOLCENGINE_ENDPOINT_ID=您的端点ID';

      return NextResponse.json({
        content: response,
        success: true,
        mode: 'mock',
      });
    }

    // 调用真实 API
    const materialType = detectMaterialType(message);
    const aiResponse = await generateWithVolcengine({
      message,
      productImage,
      history,
      materialType,
      model, // 传递模型参数
    });

    return NextResponse.json({
      content: aiResponse,
      success: true,
      mode: 'ai',
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { 
        error: '处理请求时出错',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
