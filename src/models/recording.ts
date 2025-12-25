import { query, queryOne, insert, update, remove } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

export interface Recording {
  id: string
  user_id: string
  title: string
  duration: number
  file_size: number
  file_url: string
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed'
  created_at: Date
  updated_at: Date
}

export interface CreateRecordingData {
  user_id: string
  title: string
  duration: number
  file_size: number
  file_url: string
}

// 创建录音记录
export async function createRecording(data: CreateRecordingData): Promise<Recording> {
  const id = uuidv4()

  await insert(
    `INSERT INTO recordings (id, user_id, title, duration, file_size, file_url, status)
     VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`,
    [id, data.user_id, data.title, data.duration, data.file_size, data.file_url]
  )

  const recording = await findRecordingById(id)
  if (!recording) {
    throw new Error('创建录音记录失败')
  }

  return recording
}

// 根据 ID 查找录音
export async function findRecordingById(id: string): Promise<Recording | null> {
  return queryOne<Recording>('SELECT * FROM recordings WHERE id = ?', [id])
}

// 获取用户的录音列表
export async function findRecordingsByUserId(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Recording[]> {
  return query<Recording>(
    `SELECT * FROM recordings 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  )
}

// 更新录音状态
export async function updateRecordingStatus(
  id: string,
  status: Recording['status']
): Promise<boolean> {
  const affectedRows = await update(
    'UPDATE recordings SET status = ? WHERE id = ?',
    [status, id]
  )
  return affectedRows > 0
}

// 更新录音信息
export async function updateRecording(
  id: string,
  data: Partial<Pick<Recording, 'title' | 'duration' | 'file_size' | 'file_url'>>
): Promise<Recording | null> {
  const fields: string[] = []
  const values: any[] = []

  if (data.title !== undefined) {
    fields.push('title = ?')
    values.push(data.title)
  }
  if (data.duration !== undefined) {
    fields.push('duration = ?')
    values.push(data.duration)
  }
  if (data.file_size !== undefined) {
    fields.push('file_size = ?')
    values.push(data.file_size)
  }
  if (data.file_url !== undefined) {
    fields.push('file_url = ?')
    values.push(data.file_url)
  }

  if (fields.length === 0) {
    return findRecordingById(id)
  }

  values.push(id)
  await update(`UPDATE recordings SET ${fields.join(', ')} WHERE id = ?`, values)

  return findRecordingById(id)
}

// 删除录音
export async function deleteRecording(id: string): Promise<boolean> {
  const affectedRows = await remove('DELETE FROM recordings WHERE id = ?', [id])
  return affectedRows > 0
}

// 获取录音总数
export async function getRecordingCount(userId?: string): Promise<number> {
  if (userId) {
    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM recordings WHERE user_id = ?',
      [userId]
    )
    return result?.count || 0
  } else {
    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM recordings'
    )
    return result?.count || 0
  }
}
