import pool from '../config/database'

// 数据库迁移脚本
export async function migrate() {
  const connection = await pool.getConnection()

  try {
    console.log('开始数据库迁移...')

    // 1. 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        openid VARCHAR(100) UNIQUE NOT NULL,
        nickname VARCHAR(100),
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        email VARCHAR(100),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_openid (openid),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 用户表创建成功')

    // 2. 创建录音表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS recordings (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(200) NOT NULL,
        duration INT NOT NULL COMMENT '时长（秒）',
        file_size INT NOT NULL COMMENT '文件大小（字节）',
        file_url VARCHAR(500) NOT NULL COMMENT '音频文件URL',
        status ENUM('uploading', 'uploaded', 'processing', 'completed', 'failed') DEFAULT 'uploaded',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 录音表创建成功')

    // 3. 创建报告表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(36) PRIMARY KEY,
        recording_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        transcript TEXT COMMENT '转写文本',
        analysis JSON COMMENT '分析结果',
        teacher_speech_rate DECIMAL(5,2) COMMENT '教师语速',
        student_participation DECIMAL(5,2) COMMENT '学生参与度',
        interaction_quality DECIMAL(5,2) COMMENT '互动质量',
        content_structure DECIMAL(5,2) COMMENT '内容结构',
        overall_score DECIMAL(5,2) COMMENT '综合评分',
        suggestions TEXT COMMENT '改进建议',
        status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recording_id) REFERENCES recordings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_recording_id (recording_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 报告表创建成功')

    // 4. 创建会话表（用于认证）
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token (token(255)),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 会话表创建成功')

    // 5. 创建第一个管理员用户（如果不存在）
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users')
    const userCount = (users as any)[0].count

    if (userCount === 0) {
      await connection.execute(`
        INSERT INTO users (id, openid, nickname, role)
        VALUES (UUID(), 'admin_default', '管理员', 'admin')
      `)
      console.log('✅ 默认管理员用户创建成功')
    }

    console.log('✅ 数据库迁移完成')
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error)
    throw error
  } finally {
    connection.release()
  }
}

// 如果直接运行此文件，执行迁移
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('迁移成功')
      process.exit(0)
    })
    .catch((error) => {
      console.error('迁移失败:', error)
      process.exit(1)
    })
}
