import axios from 'axios'
import { findUserByOpenid, createUser, User } from '../models/user'
import { createSession } from './auth'

const WECHAT_APP_ID = process.env.WECHAT_APP_ID
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET

export interface WechatLoginResult {
  token: string
  user: User
  isNewUser: boolean
}

// 微信小程序登录
export async function wechatMiniProgramLogin(code: string): Promise<WechatLoginResult> {
  if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
    throw new Error('微信配置未设置')
  }

  // 1. 调用微信 API 获取 openid
  const wxResponse = await axios.get(
    'https://api.weixin.qq.com/sns/jscode2session',
    {
      params: {
        appid: WECHAT_APP_ID,
        secret: WECHAT_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    }
  )

  if (wxResponse.data.errcode) {
    throw new Error(`微信接口错误: ${wxResponse.data.errmsg}`)
  }

  const { openid, session_key } = wxResponse.data

  // 2. 查找或创建用户
  let user = await findUserByOpenid(openid)
  let isNewUser = false

  if (!user) {
    // 创建新用户
    user = await createUser({
      openid,
      nickname: `用户${openid.slice(-6)}`
    })
    isNewUser = true
  }

  // 3. 创建会话
  const { token } = await createSession(user.id)

  return {
    token,
    user,
    isNewUser
  }
}

// 获取微信用户信息（需要用户授权）
export async function getWechatUserInfo(
  encryptedData: string,
  iv: string,
  sessionKey: string
): Promise<any> {
  // 这里需要实现微信数据解密
  // 可以使用 wx-js-utils 或自己实现 AES 解密
  // 暂时返回空对象
  return {}
}
