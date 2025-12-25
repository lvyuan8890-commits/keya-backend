import { query, queryOne, insert, update } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  openid: string
  nickname?: string
  avatar_url?: string
  phone?: string
  email?: string
  role: 'user' | 'admin'
  created_at: Date
  updated_at: Date
}

export interface CreateUserData {
  openid: string
  nickname?: string
  avatar_url?: string
  phone?: string
  email?: string
}

// 根据 openid 查找用户
export async function findUserByOpenid(openid: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE openid = ?', [openid])
}

// 根据 ID 查找用户
export async function findUserById(id: string): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE id = ?', [id])
}

// 创建用户
export async function createUser(data: CreateUserData): Promise<User> {
  const id = uuidv4()
  
  // 检查是否是第一个用户，如果是则设为管理员
  const users = await query('SELECT COUNT(*) as count FROM users')
  const userCount = (users as any)[0].count
  const role = userCount === 0 ? 'admin' : 'user'

  await insert(
    `INSERT INTO users (id, openid, nickname, avatar_url, phone, email, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.openid, data.nickname, data.avatar_url, data.phone, data.email, role]
  )

  const user = await findUserById(id)
  if (!user) {
    throw new Error('创建用户失败')
  }

  return user
}

// 更新用户信息
export async function updateUser(
  id: string,
  data: Partial<CreateUserData>
): Promise<User | null> {
  const fields: string[] = []
  const values: any[] = []

  if (data.nickname !== undefined) {
    fields.push('nickname = ?')
    values.push(data.nickname)
  }
  if (data.avatar_url !== undefined) {
    fields.push('avatar_url = ?')
    values.push(data.avatar_url)
  }
  if (data.phone !== undefined) {
    fields.push('phone = ?')
    values.push(data.phone)
  }
  if (data.email !== undefined) {
    fields.push('email = ?')
    values.push(data.email)
  }

  if (fields.length === 0) {
    return findUserById(id)
  }

  values.push(id)
  await update(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)

  return findUserById(id)
}

// 获取用户统计信息
export async function getUserStats(userId: string) {
  const [recordingCount] = await query(
    'SELECT COUNT(*) as count FROM recordings WHERE user_id = ?',
    [userId]
  )
  const [reportCount] = await query(
    'SELECT COUNT(*) as count FROM reports WHERE user_id = ?',
    [userId]
  )
  const [totalDuration] = await query(
    'SELECT SUM(duration) as total FROM recordings WHERE user_id = ?',
    [userId]
  )

  return {
    recording_count: (recordingCount as any).count || 0,
    report_count: (reportCount as any).count || 0,
    total_duration: (totalDuration as any).total || 0
  }
}
