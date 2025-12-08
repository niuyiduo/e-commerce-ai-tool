/**
 * MySQL 数据库连接配置
 */

import mysql from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'nyd666',
  database: process.env.DB_NAME || 'e-commerce-ai-tool',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * 执行 SQL 查询
 */
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
