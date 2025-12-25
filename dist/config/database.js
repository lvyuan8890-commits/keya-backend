"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
exports.query = query;
exports.queryOne = queryOne;
exports.insert = insert;
exports.update = update;
exports.remove = remove;
exports.transaction = transaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 数据库连接池配置
const pool = promise_1.default.createPool({
    host: process.env.MYSQL_ADDRESS || process.env.DB_HOST,
    port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
    user: process.env.MYSQL_USERNAME || process.env.DB_USER,
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'keya',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});
// 测试数据库连接
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接成功');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ 数据库连接失败:', error);
        return false;
    }
}
// 执行查询
async function query(sql, params) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
    catch (error) {
        console.error('数据库查询错误:', error);
        throw error;
    }
}
// 执行单条查询
async function queryOne(sql, params) {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
// 执行插入并返回 ID
async function insert(sql, params) {
    try {
        const [result] = await pool.execute(sql, params);
        return result.insertId;
    }
    catch (error) {
        console.error('数据库插入错误:', error);
        throw error;
    }
}
// 执行更新并返回影响行数
async function update(sql, params) {
    try {
        const [result] = await pool.execute(sql, params);
        return result.affectedRows;
    }
    catch (error) {
        console.error('数据库更新错误:', error);
        throw error;
    }
}
// 执行删除并返回影响行数
async function remove(sql, params) {
    try {
        const [result] = await pool.execute(sql, params);
        return result.affectedRows;
    }
    catch (error) {
        console.error('数据库删除错误:', error);
        throw error;
    }
}
// 事务执行
async function transaction(callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
exports.default = pool;
//# sourceMappingURL=database.js.map