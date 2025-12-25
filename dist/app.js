"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const error_1 = require("./middleware/error");
// 导入路由
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const recordings_1 = __importDefault(require("./routes/recordings"));
const reports_1 = __importDefault(require("./routes/reports"));
const upload_1 = __importDefault(require("./routes/upload"));
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 80;
// 中间件
app.use((0, helmet_1.default)()); // 安全头
app.use((0, cors_1.default)()); // 跨域
app.use((0, compression_1.default)()); // 压缩
app.use(express_1.default.json({ limit: '10mb' })); // JSON 解析
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' })); // URL 编码解析
app.use((0, morgan_1.default)('combined')); // 日志
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// API 路由
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/recordings', recordings_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/upload', upload_1.default);
// 404 处理
app.use(error_1.notFoundHandler);
// 错误处理
app.use(error_1.errorHandler);
// 启动服务器
async function startServer() {
    try {
        // 测试数据库连接
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error('❌ 数据库连接失败，服务器启动中止');
            process.exit(1);
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
      `);
        });
    }
    catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});
// 启动
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map