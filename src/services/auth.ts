import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, insert, remove } from '../config/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}

// 生成 JWT Token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

// 验证 JWT Token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch (error) {
    return null
  }
}

// 创建会话
export async function createSession(userId: string): Promise<{ token: string; session: Session }> {
  const token = generateToken(userId)
  const sessionId = uuidv4()
  
  // 计算过期时间（7天后）
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await insert(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [sessionId, userId, token, expiresAt]
  )

  const session = await queryOne<Session>(
    'SELECT * FROM sessions WHERE id = ?',
    [sessionId]
  )

  if (!session) {
    throw new Error('创建会话失败')
  }

  return { token, session }
}

// 验证会话
export async function validateSession(token: string): Promise<string | null> {
  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const session = await queryOne<Session>(
    'SELECT * FROM sessions WHERE user_id = ? AND token = ? AND expires_at > NOW()',
    [decoded.userId, token]
  )

  if (!session) {
    return null
  }

  return decoded.userId
}

// 删除会话（退出登录）
export async function deleteSession(token: string): Promise<boolean> {
  const affectedRows = await remove('DELETE FROM sessions WHERE token = ?', [token])
  return affectedRows > 0
}

// 清理过期会话
export async function cleanExpiredSessions(): Promise<number> {
  return remove('DELETE FROM sessions WHERE expires_at < NOW()')
}
