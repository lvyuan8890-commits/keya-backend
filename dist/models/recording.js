"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecording = createRecording;
exports.findRecordingById = findRecordingById;
exports.findRecordingsByUserId = findRecordingsByUserId;
exports.updateRecordingStatus = updateRecordingStatus;
exports.updateRecording = updateRecording;
exports.deleteRecording = deleteRecording;
exports.getRecordingCount = getRecordingCount;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
// 创建录音记录
async function createRecording(data) {
    const id = (0, uuid_1.v4)();
    await (0, database_1.insert)(`INSERT INTO recordings (id, user_id, title, duration, file_size, file_url, status)
     VALUES (?, ?, ?, ?, ?, ?, 'uploaded')`, [id, data.user_id, data.title, data.duration, data.file_size, data.file_url]);
    const recording = await findRecordingById(id);
    if (!recording) {
        throw new Error('创建录音记录失败');
    }
    return recording;
}
// 根据 ID 查找录音
async function findRecordingById(id) {
    return (0, database_1.queryOne)('SELECT * FROM recordings WHERE id = ?', [id]);
}
// 获取用户的录音列表
async function findRecordingsByUserId(userId, limit = 20, offset = 0) {
    return (0, database_1.query)(`SELECT * FROM recordings 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`, [userId, limit, offset]);
}
// 更新录音状态
async function updateRecordingStatus(id, status) {
    const affectedRows = await (0, database_1.update)('UPDATE recordings SET status = ? WHERE id = ?', [status, id]);
    return affectedRows > 0;
}
// 更新录音信息
async function updateRecording(id, data) {
    const fields = [];
    const values = [];
    if (data.title !== undefined) {
        fields.push('title = ?');
        values.push(data.title);
    }
    if (data.duration !== undefined) {
        fields.push('duration = ?');
        values.push(data.duration);
    }
    if (data.file_size !== undefined) {
        fields.push('file_size = ?');
        values.push(data.file_size);
    }
    if (data.file_url !== undefined) {
        fields.push('file_url = ?');
        values.push(data.file_url);
    }
    if (fields.length === 0) {
        return findRecordingById(id);
    }
    values.push(id);
    await (0, database_1.update)(`UPDATE recordings SET ${fields.join(', ')} WHERE id = ?`, values);
    return findRecordingById(id);
}
// 删除录音
async function deleteRecording(id) {
    const affectedRows = await (0, database_1.remove)('DELETE FROM recordings WHERE id = ?', [id]);
    return affectedRows > 0;
}
// 获取录音总数
async function getRecordingCount(userId) {
    if (userId) {
        const result = await (0, database_1.queryOne)('SELECT COUNT(*) as count FROM recordings WHERE user_id = ?', [userId]);
        return result?.count || 0;
    }
    else {
        const result = await (0, database_1.queryOne)('SELECT COUNT(*) as count FROM recordings');
        return result?.count || 0;
    }
}
//# sourceMappingURL=recording.js.map