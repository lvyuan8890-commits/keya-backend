import axios from 'axios'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export interface TranscriptResult {
  text: string
  speakers?: Array<{
    speaker: string
    text: string
    timestamp?: string
  }>
}

// 语音转文字
export async function speechToText(audioUrl: string): Promise<TranscriptResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key 未配置')
  }

  try {
    // 1. 下载音频文件
    const audioResponse = await axios.get(audioUrl, {
      responseType: 'arraybuffer'
    })
    const audioBase64 = Buffer.from(audioResponse.data).toString('base64')

    // 2. 调用 Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'audio/wav',
                  data: audioBase64
                }
              },
              {
                text: `请将这段音频转换为文字，并识别说话人（教师/学生）。
                
请按照以下格式输出：
[教师] 具体说话内容
[学生] 具体说话内容

如果无法区分说话人，请标注为 [未知]。`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096
        }
      }
    )

    const text = response.data.candidates[0].content.parts[0].text

    // 3. 解析说话人信息
    const speakers = parseTranscript(text)

    return {
      text,
      speakers
    }
  } catch (error: any) {
    console.error('Gemini API 错误:', error.response?.data || error.message)
    throw new Error('语音转文字失败')
  }
}

// 解析转写文本，提取说话人信息
function parseTranscript(text: string): Array<{ speaker: string; text: string }> {
  const lines = text.split('\n')
  const speakers: Array<{ speaker: string; text: string }> = []

  for (const line of lines) {
    const match = line.match(/^\[(.+?)\]\s*(.+)$/)
    if (match) {
      speakers.push({
        speaker: match[1],
        text: match[2]
      })
    }
  }

  return speakers
}

// 分析教学质量
export async function analyzeTeaching(transcript: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key 未配置')
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `请分析以下课堂转写文本，从以下维度进行评估：

1. 教师语速（每分钟字数）
2. 学生参与度（学生发言次数和时长占比）
3. 互动质量（师生对话的频率和深度）
4. 内容结构（教学内容的条理性）

转写文本：
${transcript}

请以 JSON 格式输出分析结果：
{
  "teacher_speech_rate": 数字（每分钟字数）,
  "student_participation": 数字（0-100）,
  "interaction_quality": 数字（0-100）,
  "content_structure": 数字（0-100）,
  "overall_score": 数字（0-100）,
  "suggestions": ["建议1", "建议2", ...]
}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048
        }
      }
    )

    const resultText = response.data.candidates[0].content.parts[0].text
    
    // 提取 JSON
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('无法解析分析结果')
  } catch (error: any) {
    console.error('Gemini API 错误:', error.response?.data || error.message)
    throw new Error('教学分析失败')
  }
}
