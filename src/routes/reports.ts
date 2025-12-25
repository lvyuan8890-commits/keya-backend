import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  findReportById,
  findReportsByUserId,
  findReportByRecordingId,
  deleteReport
} from '../models/report'

const router = Router()

// 获取报告列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20
    const offset = parseInt(req.query.offset as string) || 0

    const reports = await findReportsByUserId(req.userId!, limit, offset)

    res.json({
      success: true,
      data: {
        reports,
        limit,
        offset
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取报告详情
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const report = await findReportById(req.params.id)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '报告不存在'
      })
    }

    // 检查权限
    if (report.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权访问'
      })
    }

    // 解析 JSON 字段
    const reportData = {
      ...report,
      analysis: report.analysis ? JSON.parse(report.analysis as any) : null,
      suggestions: report.suggestions ? JSON.parse(report.suggestions) : null
    }

    res.json({
      success: true,
      data: reportData
    })
  } catch (error) {
    next(error)
  }
})

// 根据录音 ID 获取报告
router.get('/recording/:recordingId', authMiddleware, async (req, res, next) => {
  try {
    const report = await findReportByRecordingId(req.params.recordingId)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '报告不存在'
      })
    }

    // 检查权限
    if (report.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权访问'
      })
    }

    // 解析 JSON 字段
    const reportData = {
      ...report,
      analysis: report.analysis ? JSON.parse(report.analysis as any) : null,
      suggestions: report.suggestions ? JSON.parse(report.suggestions) : null
    }

    res.json({
      success: true,
      data: reportData
    })
  } catch (error) {
    next(error)
  }
})

// 删除报告
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const report = await findReportById(req.params.id)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '报告不存在'
      })
    }

    // 检查权限
    if (report.user_id !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权操作'
      })
    }

    await deleteReport(req.params.id)

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    next(error)
  }
})

export default router
