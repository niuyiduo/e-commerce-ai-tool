/**
 * 生成记录持久化 API
 * 提供写入和读取生成历史记录的接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST - 保存生成记录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      material_type,
      title,
      selling_points,
      atmosphere_text,
      atmosphere_image_url,
      raw_response,
    } = body;

    console.log('========== 开始保存生成记录 ==========');
    console.log('素材类型:', material_type);
    console.log('商品标题:', title);
    console.log('商品卖点:', selling_points);
    console.log('装饰文字:', atmosphere_text);

    const sql = `
      INSERT INTO atmosphere_generations 
      (prompt, material_type, title, selling_points, atmosphere_text, atmosphere_image_url, raw_response)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      prompt,
      material_type,
      title,
      selling_points,
      atmosphere_text,
      atmosphere_image_url,
      raw_response,
    ]);

    console.log('✅ 记录保存成功！');
    console.log('保存结果:', result);
    console.log('========================================');

    return NextResponse.json({
      success: true,
      message: '记录保存成功',
      data: result,
    });
  } catch (error: any) {
    console.error('========== 保存记录失败 ==========');
    console.error('❌ 错误信息:', error.message);
    console.error('错误详情:', error);
    console.error('====================================');
    return NextResponse.json(
      {
        success: false,
        error: error.message || '保存记录失败',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - 获取生成记录
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const material_type = searchParams.get('type');

    console.log('========== 查询生成记录 ==========');
    console.log('查询类型:', material_type || '全部');
    console.log('查询数量:', limit);

    let sql = 'SELECT * FROM atmosphere_generations';
    const params: any[] = [];

    if (material_type) {
      sql += ' WHERE material_type = ?';
      params.push(material_type);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const results = await query(sql, params);

    console.log('✅ 查询成功！找到', Array.isArray(results) ? results.length : 0, '条记录');
    console.log('====================================');

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('========== 查询记录失败 ==========');
    console.error('❌ 错误信息:', error.message);
    console.error('错误详情:', error);
    console.error('====================================');
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取记录失败',
      },
      { status: 500 }
    );
  }
}
