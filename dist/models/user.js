"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByOpenid = findUserByOpenid;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.getUserStats = getUserStats;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
// 根据 openid 查找用户
async function findUserByOpenid(openid) {
    return (0, database_1.queryOne)('SELECT * FROM users WHERE openid = ?', [openid]);
}
// 根据 ID 查找用户
async function findUserById(id) {
    return (0, database_1.queryOne)('SELECT * FROM users WHERE id = ?', [id]);
}
// 创建用户
async function createUser(data) {
    const id = (0, uuid_1.v4)();
    // 检查是否是第一个用户，如果是则设为管理员
    const users = await (0, database_1.query)('SELECT COUNT(*) as count FROM users');
    const userCount = users[0].count;
    const role = userCount === 0 ? 'admin' : 'user';
    await (0, database_1.insert)(`INSERT INTO users (id, openid, nickname, avatar_url, phone, email, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, data.openid, data.nickname, data.avatar_url, data.phone, data.email, role]);
    const user = await findUserById(id);
    if (!user) {
        throw new Error('创建用户失败');
    }
    return user;
}
// 更新用户信息
async function updateUser(id, data) {
    const fields = [];
    const values = [];
    if (data.nickname !== undefined) {
        fields.push('nickname = ?');
        values.push(data.nickname);
    }
    if (data.avatar_url !== undefined) {
        fields.push('avatar_url = ?');
        values.push(data.avatar_url);
    }
    if (data.phone !== undefined) {
        fields.push('phone = ?');
        values.push(data.phone);
    }
    if (data.email !== undefined) {
        fields.push('email = ?');
        values.push(data.email);
    }
    if (fields.length === 0) {
        return findUserById(id);
    }
    values.push(id);
    await (0, database_1.update)(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return findUserById(id);
}
// 获取用户统计信息
async function getUserStats(userId) {
    const [recordingCount] = await (0, database_1.query)('SELECT COUNT(*) as count FROM recordings WHERE user_id = ?', [userId]);
    const [reportCount] = await (0, database_1.query)('SELECT COUNT(*) as count FROM reports WHERE user_id = ?', [userId]);
    const [totalDuration] = await (0, database_1.query)('SELECT SUM(duration) as total FROM recordings WHERE user_id = ?', [userId]);
    return {
        recording_count: recordingCount.count || 0,
        report_count: reportCount.count || 0,
        total_duration: totalDuration.total || 0
    };
}
//# sourceMappingURL=user.js.map