import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { testConnection } from './config/database'
import { errorHandler, notFoundHandler } from './middleware/error'

// 导入路由
import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import recordingsRoutes from './routes/recordings'
import reportsRoutes from './routes/reports'
import uploadRoutes from './routes/upload'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 80

// 中间件
app.use(helmet()) // 安全头
app.use(cors()) // 跨域
app.use(compression()) // 压缩
app.use(express.json({ limit: '10mb' })) // JSON 解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })) // URL 编码解析
app.use(morgan('combined')) // 日志

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/recordings', recordingsRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/upload', uploadRoutes)

// 404 处理
app.use(notFoundHandler)

// 错误处理
app.use(errorHandler)

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务器启动中止')
      process.exit(1)
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                    课芽 - 云托管 API 服务                       ║
║                                                               ║
║                         服务已启动                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

✅ 服务器运行在端口: ${PORT}
✅ 环境: ${process.env.NODE_ENV || 'development'}
✅ 数据库: 已连接
✅ 健康检查: http://localhost:${PORT}/health

API 端点:
- POST   /api/auth/wechat-login     微信登录
- POST   /api/auth/logout           退出登录
- GET    /api/users/me              获取当前用户
- PUT    /api/users/me              更新用户信息
- POST   /api/upload                上传文件
- GET    /api/recordings            获取录音列表
- POST   /api/recordings            创建录音记录
- GET    /api/recordings/:id        获取录音详情
- POST   /api/recordings/:id/transcribe  语音转文字
- GET    /api/reports               获取报告列表
- GET    /api/reports/:id           获取报告详情
      `)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...')
  process.exit(0)
})

// 启动
startServer()

export default app
