"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
exports.adminMiddleware = adminMiddleware;
const auth_1 = require("../services/auth");
const user_1 = require("../models/user");
// 认证中间件
async function authMiddleware(req, res, next) {
    try {
        // 从 Authorization header 获取 token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '未提供认证令牌'
            });
        }
        const token = authHeader.substring(7); // 移除 "Bearer " 前缀
        // 验证 token
        const userId = await (0, auth_1.validateSession)(token);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: '认证令牌无效或已过期'
            });
        }
        // 获取用户信息
        const user = await (0, user_1.findUserById)(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在'
            });
        }
        // 将用户信息附加到请求对象
        req.user = {
            id: user.id,
            openid: user.openid,
            nickname: user.nickname,
            role: user.role
        };
        req.userId = user.id;
        next();
    }
    catch (error) {
        console.error('认证中间件错误:', error);
        res.status(500).json({
            success: false,
            message: '认证失败'
        });
    }
}
// 可选认证中间件（不强制要求登录）
async function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const userId = await (0, auth_1.validateSession)(token);
            if (userId) {
                const user = await (0, user_1.findUserById)(userId);
                if (user) {
                    req.user = {
                        id: user.id,
                        openid: user.openid,
                        nickname: user.nickname,
                        role: user.role
                    };
                    req.userId = user.id;
                }
            }
        }
        next();
    }
    catch (error) {
        // 可选认证失败不影响请求继续
        next();
    }
}
// 管理员权限中间件
function adminMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '未认证'
        });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '权限不足'
        });
    }
    next();
}
//# sourceMappingURL=auth.js.map