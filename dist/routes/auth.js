"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wechat_1 = require("../services/wechat");
const auth_1 = require("../services/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 微信小程序登录
router.post('/wechat-login', async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({
                success: false,
                message: '缺少 code 参数'
            });
        }
        const result = await (0, wechat_1.wechatMiniProgramLogin)(code);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
});
// 退出登录
router.post('/logout', auth_2.authMiddleware, async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            await (0, auth_1.deleteSession)(token);
        }
        res.json({
            success: true,
            message: '退出登录成功'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map