"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const storage_1 = require("../services/storage");
const router = (0, express_1.Router)();
// 配置 multer（内存存储）
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('只支持音频文件'));
        }
    }
});
// 上传文件
router.post('/', auth_1.authMiddleware, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '未上传文件'
            });
        }
        // 上传到 COS
        const result = await (0, storage_1.uploadFile)(req.file.buffer, req.file.originalname, req.file.mimetype);
        res.json({
            success: true,
            data: {
                url: result.url,
                key: result.key,
                size: result.size
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map