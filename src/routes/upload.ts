import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth'
import { uploadFile } from '../services/storage'

const router = Router()

// 配置 multer（内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许音频文件
    const allowedMimes = [
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4'
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持音频文件'))
    }
  }
})

// 上传文件
router.post('/', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未上传文件'
      })
    }

    // 上传到 COS
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )

    res.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        size: result.size
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
