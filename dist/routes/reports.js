"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const report_1 = require("../models/report");
const router = (0, express_1.Router)();
// 获取报告列表
router.get('/', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const reports = await (0, report_1.findReportsByUserId)(req.userId, limit, offset);
        res.json({
            success: true,
            data: {
                reports,
                limit,
                offset
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// 获取报告详情
router.get('/:id', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const report = await (0, report_1.findReportById)(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: '报告不存在'
            });
        }
        // 检查权限
        if (report.user_id !== req.userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '无权访问'
            });
        }
        // 解析 JSON 字段
        const reportData = {
            ...report,
            analysis: report.analysis ? JSON.parse(report.analysis) : null,
            suggestions: report.suggestions ? JSON.parse(report.suggestions) : null
        };
        res.json({
            success: true,
            data: reportData
        });
    }
    catch (error) {
        next(error);
    }
});
// 根据录音 ID 获取报告
router.get('/recording/:recordingId', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const report = await (0, report_1.findReportByRecordingId)(req.params.recordingId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: '报告不存在'
            });
        }
        // 检查权限
        if (report.user_id !== req.userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '无权访问'
            });
        }
        // 解析 JSON 字段
        const reportData = {
            ...report,
            analysis: report.analysis ? JSON.parse(report.analysis) : null,
            suggestions: report.suggestions ? JSON.parse(report.suggestions) : null
        };
        res.json({
            success: true,
            data: reportData
        });
    }
    catch (error) {
        next(error);
    }
});
// 删除报告
router.delete('/:id', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const report = await (0, report_1.findReportById)(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: '报告不存在'
            });
        }
        // 检查权限
        if (report.user_id !== req.userId && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '无权操作'
            });
        }
        await (0, report_1.deleteReport)(req.params.id);
        res.json({
            success: true,
            message: '删除成功'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map