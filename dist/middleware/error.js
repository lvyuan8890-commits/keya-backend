"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
// 错误处理中间件
function errorHandler(error, req, res, next) {
    console.error('错误:', error);
    // 如果响应已经发送，交给默认错误处理器
    if (res.headersSent) {
        return next(error);
    }
    // 返回错误响应
    res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
}
// 404 处理中间件
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
}
//# sourceMappingURL=error.js.map