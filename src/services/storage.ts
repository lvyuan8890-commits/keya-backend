import COS from 'cos-nodejs-sdk-v5'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
})

const BUCKET = process.env.COS_BUCKET || ''
const REGION = process.env.COS_REGION || 'ap-shanghai'

export interface UploadResult {
  url: string
  key: string
  size: number
}

// 上传文件到 COS
export async function uploadFile(
  fileBuffer: Buffer,
  originalName: string,
  contentType: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // 生成唯一文件名
    const ext = path.extname(originalName)
    const fileName = `${uuidv4()}${ext}`
    const key = `audio/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`

    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType
      },
      (err, data) => {
        if (err) {
          reject(err)
          return
        }

        // 生成访问 URL
        const url = `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`

        resolve({
          url,
          key,
          size: fileBuffer.length
        })
      }
    )
  })
}

// 删除文件
export async function deleteFile(key: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key
      },
      (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(true)
      }
    )
  })
}

// 获取文件临时访问 URL（用于私有文件）
export async function getFileUrl(key: string, expires: number = 3600): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Sign: true,
        Expires: expires
      },
      (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data.Url)
      }
    )
  })
}

// 批量删除文件
export async function deleteFiles(keys: string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cos.deleteMultipleObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Objects: keys.map(key => ({ Key: key }))
      },
      (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(true)
      }
    )
  })
}
