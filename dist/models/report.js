"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = createReport;
exports.findReportById = findReportById;
exports.findReportByRecordingId = findReportByRecordingId;
exports.findReportsByUserId = findReportsByUserId;
exports.updateReport = updateReport;
exports.deleteReport = deleteReport;
exports.getReportCount = getReportCount;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
// 创建报告
async function createReport(data) {
    const id = (0, uuid_1.v4)();
    await (0, database_1.insert)(`INSERT INTO reports (id, recording_id, user_id, status)
     VALUES (?, ?, ?, 'processing')`, [id, data.recording_id, data.user_id]);
    const report = await findReportById(id);
    if (!report) {
        throw new Error('创建报告失败');
    }
    return report;
}
// 根据 ID 查找报告
async function findReportById(id) {
    return (0, database_1.queryOne)('SELECT * FROM reports WHERE id = ?', [id]);
}
// 根据录音 ID 查找报告
async function findReportByRecordingId(recordingId) {
    return (0, database_1.queryOne)('SELECT * FROM reports WHERE recording_id = ?', [recordingId]);
}
// 获取用户的报告列表
async function findReportsByUserId(userId, limit = 20, offset = 0) {
    return (0, database_1.query)(`SELECT * FROM reports 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`, [userId, limit, offset]);
}
// 更新报告
async function updateReport(id, data) {
    const fields = [];
    const values = [];
    if (data.transcript !== undefined) {
        fields.push('transcript = ?');
        values.push(data.transcript);
    }
    if (data.analysis !== undefined) {
        fields.push('analysis = ?');
        values.push(JSON.stringify(data.analysis));
    }
    if (data.teacher_speech_rate !== undefined) {
        fields.push('teacher_speech_rate = ?');
        values.push(data.teacher_speech_rate);
    }
    if (data.student_participation !== undefined) {
        fields.push('student_participation = ?');
        values.push(data.student_participation);
    }
    if (data.interaction_quality !== undefined) {
        fields.push('interaction_quality = ?');
        values.push(data.interaction_quality);
    }
    if (data.content_structure !== undefined) {
        fields.push('content_structure = ?');
        values.push(data.content_structure);
    }
    if (data.overall_score !== undefined) {
        fields.push('overall_score = ?');
        values.push(data.overall_score);
    }
    if (data.suggestions !== undefined) {
        fields.push('suggestions = ?');
        values.push(data.suggestions);
    }
    if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
    }
    if (fields.length === 0) {
        return findReportById(id);
    }
    values.push(id);
    await (0, database_1.update)(`UPDATE reports SET ${fields.join(', ')} WHERE id = ?`, values);
    return findReportById(id);
}
// 删除报告
async function deleteReport(id) {
    const affectedRows = await (0, database_1.remove)('DELETE FROM reports WHERE id = ?', [id]);
    return affectedRows > 0;
}
// 获取报告总数
async function getReportCount(userId) {
    if (userId) {
        const result = await (0, database_1.queryOne)('SELECT COUNT(*) as count FROM reports WHERE user_id = ?', [userId]);
        return result?.count || 0;
    }
    else {
        const result = await (0, database_1.queryOne)('SELECT COUNT(*) as count FROM reports');
        return result?.count || 0;
    }
}
//# sourceMappingURL=report.js.map