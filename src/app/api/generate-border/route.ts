import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

/**
 * 火山引擎签名认证
 * 参考文档：https://www.volcengine.com/docs/6791/65902
 */
function generateVolcengineSignature({
  accessKeyId,
  secretKey,
  service,
  region,
  method,
  path,
  query,
  body
}: {
  accessKeyId: string;
  secretKey: string;
  service: string;
  region: string;
  method: string;
  path: string;
  query: Record<string, string>;
  body: any;
}) {
  const now = new Date();
  const dateStamp = now.toISOString().split('T')[0].replace(/-/g, '');
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');

  // 1. 创建规范请求
  const canonicalQueryString = Object.keys(query)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&');

  const bodyString = JSON.stringify(body);
  const payloadHash = crypto.createHash('sha256').update(bodyString).digest('hex');

  const canonicalHeaders = [
    `content-type:application/json`,
    `host:visual.volcengineapi.com`,
    `x-content-sha256:${payloadHash}`,
    `x-date:${amzDate}`
  ].join('\n');

  const signedHeaders = 'content-type;host;x-content-sha256;x-date';

  const canonicalRequest = [
    method,
    path,
    canonicalQueryString,
    canonicalHeaders,
    '',
    signedHeaders,
    payloadHash
  ].join('\n');

  // 2. 创建待签名字符串
  const credentialScope = `${dateStamp}/${region}/${service}/request`;
  const requestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = [
    'HMAC-SHA256',
    amzDate,
    credentialScope,
    requestHash
  ].join('\n');

  // 3. 计算签名
  const kDate = crypto.createHmac('sha256', secretKey).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // 4. 构建 Authorization header
  const authorization = `HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    authorization,
    xDate: amzDate,
    xContentSha256: payloadHash
  };
}

/**
 * 火山引擎"通用2.1-文生图"API - 生成装饰边框
 * 接口文档：https://visual.volcengineapi.com
 * 🔥 仅在高级定制模式 + Thinking模型时调用
 */

// 边框风格 Prompt 模板
const BORDER_PROMPTS = {
  simple: {
    style: '简约现代风格',
    description: '简洁大方的四角边框装饰图案，线条流畅，留空中间区域用于放置商品图片',
    layout: '边框位于画面四周，中间透明或留白'
  },
  guochao: {
    style: '中国传统国潮风格',
    description: '红色和金色的中国传统装饰边框，包含祥云、祥龙、灯笼等元素，喜庆氛围',
    layout: '装饰性边框围绕四周，中间区域留白用于商品展示'
  },
  gradient: {
    style: '渐变霓虹风格',
    description: '多彩渐变色边框，带有霓虹发光效果，炫酷动感，现代科技感',
    layout: '发光边框环绕四周，中心区域透明'
  },
  luxury: {
    style: '奢华金色风格',
    description: '金色华丽装饰边框，带有精致花纹和雕刻细节，高端奢华质感',
    layout: '精美边框装饰四周，中间预留商品位置'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { borderStyle } = await request.json();

    // 验证边框风格
    if (!borderStyle || !BORDER_PROMPTS[borderStyle as keyof typeof BORDER_PROMPTS]) {
      return NextResponse.json(
        { success: false, error: '无效的边框风格' },
        { status: 400 }
      );
    }

    const template = BORDER_PROMPTS[borderStyle as keyof typeof BORDER_PROMPTS];

    // 构建 Prompt（按照火山引擎文档格式）
    const prompt = `【${template.style}】+【${template.description}】+【${template.layout}】，高质量，专业设计，抖音电商风格`;

    console.log('🎨 正在生成边框素材:', borderStyle);
    console.log('📝 Prompt:', prompt);

    // 🔥 调用火山引擎"通用2.1-文生图" API
    // Region: cn-north-1, Service: cv
    const accessKeyId = process.env.VOLCENGINE_ACCESS_KEY || '';
    const secretKey = process.env.VOLCENGINE_SECRET_KEY || '';

    if (!accessKeyId || !secretKey) {
      throw new Error('未配置火山引擎 AccessKey 或 SecretKey，请在 .env.local 中添加 VOLCENGINE_ACCESS_KEY 和 VOLCENGINE_SECRET_KEY');
    }

    const requestBody = {
      req_key: 'high_aes_general_v21_L', // 通用2.1-文生图模型
      prompt: prompt,
      llm_seed: -1,
      seed: -1,
      scale: 3.5,
      ddim_steps: 25,
      width: 1024,
      height: 1024,
      use_pre_llm: true,
      use_sr: true,
      return_url: true
    };

    const query = {
      Action: 'CVProcess',
      Version: '2022-08-31'
    };

    // 生成签名
    const { authorization, xDate, xContentSha256 } = generateVolcengineSignature({
      accessKeyId,
      secretKey,
      service: 'cv',
      region: 'cn-north-1',
      method: 'POST',
      path: '/',
      query,
      body: requestBody
    });

    console.log('📤 请求参数:', JSON.stringify(requestBody, null, 2));

    const apiUrl = `https://visual.volcengineapi.com/?${new URLSearchParams(query).toString()}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'visual.volcengineapi.com',
        'X-Date': xDate,
        'X-Content-Sha256': xContentSha256,
        'Authorization': authorization
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 火山引擎 API 错误:', errorText);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 API响应:', JSON.stringify(data, null, 2));

    // 检查返回数据
    if (!data.data || !data.data[0] || !data.data[0].image_url) {
      console.error('❌ API 返回数据格式错误:', data);
      throw new Error('生成失败，请稍后重试');
    }

    console.log('✅ 边框生成成功:', data.data[0].image_url);

    // 💾 保存到 MySQL 数据库
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'e-commerce-ai-tool'
      });

      await connection.execute(
        'INSERT INTO ai_generated_borders (border_style, image_url, created_at) VALUES (?, ?, NOW())',
        [borderStyle, data.data[0].image_url]
      );

      await connection.end();
      console.log('💾 边框已保存到数据库');
    } catch (dbError) {
      console.error('⚠️ 数据库保存失败:', dbError);
      // 数据库失败不影响返回结果
    }

    return NextResponse.json({
      success: true,
      imageUrl: data.data[0].image_url,
      borderStyle: borderStyle
    });

  } catch (error: any) {
    console.error('❌ 边框生成失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '生成失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}
