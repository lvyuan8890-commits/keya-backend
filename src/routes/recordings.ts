import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  createRecording,
  findRecordingById,
  findRecordingsByUserId,
  updateRecording,
  deleteRecording,
  updateRecordingStatus
} from '../models/recording'
import { createReport } from '../models/report'
import { speechToText, analyzeTeaching } from '../services/gemini'
import { updateReport } from '../models/report'

const router = Router()

// 创建录音记录
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, duration, file_size, file_url } = req.body

    if (!title || !duration || !file_size || !file_url) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      })
    }

    const recording = await createRecording({
      user_id: req.userId!,
      title,
      duration,
      file_size,
      file_url
    })

    res.json({
      success: true,
      data: recording
    })
  } catch (error) {
    next(error)
  }
})

// 获取录音列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    const recordings = await findRecordingsByUserId(req.userId!, limit, offset)

    res.json({
      success: true,
      data: {
        recordings,
        limit,
        offset
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取录音详情
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const recording = await findRecordingById(req.params.id)

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: '录音不存在'
      })
    }

    // 检查权限
    if (recording.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权访问'
      })
    }

    res.json({
      success: true,
      data: recording
    })
  } catch (error) {
    next(error)
  }
})

// 更新录音信息
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const recording = await findRecordingById(req.params.id)

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: '录音不存在'
      })
    }

    // 检查权限
    if (recording.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权操作'
      })
    }

    const { title } = req.body
    const updatedRecording = await updateRecording(req.params.id, { title })

    res.json({
      success: true,
      data: updatedRecording
    })
  } catch (error) {
    next(error)
  }
})

// 删除录音
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const recording = await findRecordingById(req.params.id)

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: '录音不存在'
      })
    }

    // 检查权限
    if (recording.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权操作'
      })
    }

    await deleteRecording(req.params.id)

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    next(error)
  }
})

// 语音转文字
router.post('/:id/transcribe', authMiddleware, async (req, res, next) => {
  try {
    const recording = await findRecordingById(req.params.id)

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: '录音不存在'
      })
    }

    // 检查权限
    if (recording.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权操作'
      })
    }

    // 更新状态为处理中
    await updateRecordingStatus(req.params.id, 'processing')

    // 异步处理转写和分析
    processTranscription(req.params.id, recording.file_url, req.userId!)
      .catch(error => {
        console.error('转写处理错误:', error)
      })

    res.json({
      success: true,
      message: '开始处理，请稍后查看报告'
    })
  } catch (error) {
    next(error)
  }
})

// 异步处理转写和分析
async function processTranscription(recordingId: string, fileUrl: string, userId: string) {
  try {
    // 1. 语音转文字
    const transcriptResult = await speechToText(fileUrl)

    // 2. 创建报告
    const report = await createReport({
      recording_id: recordingId,
      user_id: userId
    })

    // 3. 分析教学质量
    const analysis = await analyzeTeaching(transcriptResult.text)

    // 4. 更新报告
    await updateReport(report.id, {
      transcript: transcriptResult.text,
      analysis,
      teacher_speech_rate: analysis.teacher_speech_rate,
      student_participation: analysis.student_participation,
      interaction_quality: analysis.interaction_quality,
      content_structure: analysis.content_structure,
      overall_score: analysis.overall_score,
      suggestions: JSON.stringify(analysis.suggestions),
      status: 'completed'
    })

    // 5. 更新录音状态
    await updateRecordingStatus(recordingId, 'completed')
  } catch (error) {
    console.error('转写处理失败:', error)
    await updateRecordingStatus(recordingId, 'failed')
  }
}

export default router
