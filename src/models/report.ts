import { query, queryOne, insert, update, remove } from '../config/database'
import { v4 as uuidv4 } from 'uuid'

export interface Report {
  id: string
  recording_id: string
  user_id: string
  transcript: string | null
  analysis: any | null
  teacher_speech_rate: number | null
  student_participation: number | null
  interaction_quality: number | null
  content_structure: number | null
  overall_score: number | null
  suggestions: string | null
  status: 'processing' | 'completed' | 'failed'
  created_at: Date
  updated_at: Date
}

export interface CreateReportData {
  recording_id: string
  user_id: string
}

export interface UpdateReportData {
  transcript?: string
  analysis?: any
  teacher_speech_rate?: number
  student_participation?: number
  interaction_quality?: number
  content_structure?: number
  overall_score?: number
  suggestions?: string
  status?: Report['status']
}

// 创建报告
export async function createReport(data: CreateReportData): Promise<Report> {
  const id = uuidv4()

  await insert(
    `INSERT INTO reports (id, recording_id, user_id, status)
     VALUES (?, ?, ?, 'processing')`,
    [id, data.recording_id, data.user_id]
  )

  const report = await findReportById(id)
  if (!report) {
    throw new Error('创建报告失败')
  }

  return report
}

// 根据 ID 查找报告
export async function findReportById(id: string): Promise<Report | null> {
  return queryOne<Report>('SELECT * FROM reports WHERE id = ?', [id])
}

// 根据录音 ID 查找报告
export async function findReportByRecordingId(recordingId: string): Promise<Report | null> {
  return queryOne<Report>('SELECT * FROM reports WHERE recording_id = ?', [recordingId])
}

// 获取用户的报告列表
export async function findReportsByUserId(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Report[]> {
  return query<Report>(
    `SELECT * FROM reports 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  )
}

// 更新报告
export async function updateReport(
  id: string,
  data: UpdateReportData
): Promise<Report | null> {
  const fields: string[] = []
  const values: any[] = []

  if (data.transcript !== undefined) {
    fields.push('transcript = ?')
    values.push(data.transcript)
  }
  if (data.analysis !== undefined) {
    fields.push('analysis = ?')
    values.push(JSON.stringify(data.analysis))
  }
  if (data.teacher_speech_rate !== undefined) {
    fields.push('teacher_speech_rate = ?')
    values.push(data.teacher_speech_rate)
  }
  if (data.student_participation !== undefined) {
    fields.push('student_participation = ?')
    values.push(data.student_participation)
  }
  if (data.interaction_quality !== undefined) {
    fields.push('interaction_quality = ?')
    values.push(data.interaction_quality)
  }
  if (data.content_structure !== undefined) {
    fields.push('content_structure = ?')
    values.push(data.content_structure)
  }
  if (data.overall_score !== undefined) {
    fields.push('overall_score = ?')
    values.push(data.overall_score)
  }
  if (data.suggestions !== undefined) {
    fields.push('suggestions = ?')
    values.push(data.suggestions)
  }
  if (data.status !== undefined) {
    fields.push('status = ?')
    values.push(data.status)
  }

  if (fields.length === 0) {
    return findReportById(id)
  }

  values.push(id)
  await update(`UPDATE reports SET ${fields.join(', ')} WHERE id = ?`, values)

  return findReportById(id)
}

// 删除报告
export async function deleteReport(id: string): Promise<boolean> {
  const affectedRows = await remove('DELETE FROM reports WHERE id = ?', [id])
  return affectedRows > 0
}

// 获取报告总数
export async function getReportCount(userId?: string): Promise<number> {
  if (userId) {
    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM reports WHERE user_id = ?',
      [userId]
    )
    return result?.count || 0
  } else {
    const result = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM reports'
    )
    return result?.count || 0
  }
}
