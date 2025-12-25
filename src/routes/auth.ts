import { Router } from 'express'
import { wechatMiniProgramLogin } from '../services/wechat'
import { deleteSession } from '../services/auth'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 微信小程序登录
router.post('/wechat-login', async (req, res, next) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少 code 参数'
      })
    }

    const result = await wechatMiniProgramLogin(code)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 退出登录
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      await deleteSession(token)
    }

    res.json({
      success: true,
      message: '退出登录成功'
    })
  } catch (error) {
    next(error)
  }
})

export default router
