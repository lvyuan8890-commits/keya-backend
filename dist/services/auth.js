"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.createSession = createSession;
exports.validateSession = validateSession;
exports.deleteSession = deleteSession;
exports.cleanExpiredSessions = cleanExpiredSessions;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// 生成 JWT Token
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
// 验证 JWT Token
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
}
// 创建会话
async function createSession(userId) {
    const token = generateToken(userId);
    const sessionId = (0, uuid_1.v4)();
    // 计算过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await (0, database_1.insert)('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)', [sessionId, userId, token, expiresAt]);
    const session = await (0, database_1.queryOne)('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session) {
        throw new Error('创建会话失败');
    }
    return { token, session };
}
// 验证会话
async function validateSession(token) {
    const decoded = verifyToken(token);
    if (!decoded) {
        return null;
    }
    const session = await (0, database_1.queryOne)('SELECT * FROM sessions WHERE user_id = ? AND token = ? AND expires_at > NOW()', [decoded.userId, token]);
    if (!session) {
        return null;
    }
    return decoded.userId;
}
// 删除会话（退出登录）
async function deleteSession(token) {
    const affectedRows = await (0, database_1.remove)('DELETE FROM sessions WHERE token = ?', [token]);
    return affectedRows > 0;
}
// 清理过期会话
async function cleanExpiredSessions() {
    return (0, database_1.remove)('DELETE FROM sessions WHERE expires_at < NOW()');
}
//# sourceMappingURL=auth.js.map