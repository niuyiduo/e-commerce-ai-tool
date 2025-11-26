/**
 * 火山引擎语音合成 API 路由
 * 使用 V1 HTTP 非流式接口
 */

import { NextRequest, NextResponse } from 'next/server';

const TTS_API_URL = 'https://openspeech.bytedance.com/api/v1/tts';
const APP_ID = process.env.VOLCENGINE_TTS_APP_ID || '';
const ACCESS_TOKEN = process.env.VOLCENGINE_TTS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceType = 'female' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: '缺少文本内容' },
        { status: 400 }
      );
    }

    console.log('TTS请求 - 文本:', text);
    console.log('TTS请求 - 音色:', voiceType);

    // 音色映射（使用免费基础音色）
    const voiceMapping: Record<string, string> = {
      male: 'BV002_streaming',    // 通用男声（免费）
      female: 'BV001_streaming',  // 通用女声（免费）
    };

    const voiceId = voiceMapping[voiceType] || voiceMapping.female;

    // 构建请求体
    const requestBody = {
      app: {
        appid: APP_ID,
        token: 'access_token',  // Fake token，根据文档说明，这里可以是任意非空字符串
        cluster: 'volcano_tts',
      },
      user: {
        uid: 'user_' + Date.now(),
      },
      audio: {
        voice_type: voiceId,
        encoding: 'mp3',
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0,
      },
      request: {
        reqid: Date.now().toString(),
        text: text,
        text_type: 'plain',
        operation: 'query',
      },
    };

    console.log('TTS请求体:', JSON.stringify(requestBody, null, 2));

    // 调用TTS API（正确的Authorization格式：Bearer; token）
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer; ${ACCESS_TOKEN}`,  // 注意：Bearer和token之间是分号+空格
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('TTS响应状态:', response.status);
    console.log('TTS响应完整内容:', JSON.stringify(result, null, 2));

    // V3 API 可能返回不同的字段结构
    if (!response.ok) {
      throw new Error(`TTS API HTTP错误: ${response.status} - ${JSON.stringify(result)}`);
    }

    // 检查返回结果（V3 API的code字段可能不同）
    if (result.code && result.code !== 3000 && result.code !== 0) {
      throw new Error(`TTS API 错误: ${result.message || result.text || result.error || '未知错误'} (code: ${result.code})`);
    }

    // V3 API 可能返回 data 或 audio_data
    const audioData = result.data || result.audio_data || result.audio;
    
    if (!audioData) {
      throw new Error(`TTS API 返回数据缺失音频字段: ${JSON.stringify(result)}`);
    }

    return NextResponse.json({
      success: true,
      audioData: audioData,
      format: 'mp3',
    });

  } catch (error) {
    console.error('语音合成失败:', error);
    return NextResponse.json(
      { 
        error: '语音合成失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}
