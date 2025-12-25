import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 数据库连接池配置
const pool = mysql.createPool({
  host: process.env.MYSQL_ADDRESS || process.env.DB_HOST,
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
  user: process.env.MYSQL_USERNAME || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'keya',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

// 执行查询
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows as T[]
  } catch (error) {
    console.error('数据库查询错误:', error)
    throw error
  }
}

// 执行单条查询
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

// 执行插入并返回 ID
export async function insert(sql: string, params?: any[]): Promise<number> {
  try {
    const [result] = await pool.execute(sql, params)
    return (result as any).insertId
  } catch (error) {
    console.error('数据库插入错误:', error)
    throw error
  }
}

// 执行更新并返回影响行数
export async function update(sql: string, params?: any[]): Promise<number> {
  try {
    const [result] = await pool.execute(sql, params)
    return (result as any).affectedRows
  } catch (error) {
    console.error('数据库更新错误:', error)
    throw error
  }
}

// 执行删除并返回影响行数
export async function remove(sql: string, params?: any[]): Promise<number> {
  try {
    const [result] = await pool.execute(sql, params)
    return (result as any).affectedRows
  } catch (error) {
    console.error('数据库删除错误:', error)
    throw error
  }
}

// 事务执行
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default pool
