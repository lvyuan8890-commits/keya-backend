"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const user_1 = require("../models/user");
const router = (0, express_1.Router)();
// 获取当前用户信息
router.get('/me', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const user = await (0, user_1.findUserById)(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        // 获取用户统计信息
        const stats = await (0, user_1.getUserStats)(req.userId);
        res.json({
            success: true,
            data: {
                user,
                stats
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// 更新用户信息
router.put('/me', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { nickname, avatar_url, phone, email } = req.body;
        const updatedUser = await (0, user_1.updateUser)(req.userId, {
            nickname,
            avatar_url,
            phone,
            email
        });
        res.json({
            success: true,
            data: updatedUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map