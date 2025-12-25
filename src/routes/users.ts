import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { findUserById, getUserStats, updateUser } from '../models/user'

const router = Router()

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await findUserById(req.userId!)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 获取用户统计信息
    const stats = await getUserStats(req.userId!)

    res.json({
      success: true,
      data: {
        user,
        stats
      }
    })
  } catch (error) {
    next(error)
  }
})

// 更新用户信息
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { nickname, avatar_url, phone, email } = req.body

    const updatedUser = await updateUser(req.userId!, {
      nickname,
      avatar_url,
      phone,
      email
    })

    res.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    next(error)
  }
})

export default router
