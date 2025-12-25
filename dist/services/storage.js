"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.deleteFile = deleteFile;
exports.getFileUrl = getFileUrl;
exports.deleteFiles = deleteFiles;
const cos_nodejs_sdk_v5_1 = __importDefault(require("cos-nodejs-sdk-v5"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const cos = new cos_nodejs_sdk_v5_1.default({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY
});
const BUCKET = process.env.COS_BUCKET || '';
const REGION = process.env.COS_REGION || 'ap-shanghai';
// 上传文件到 COS
async function uploadFile(fileBuffer, originalName, contentType) {
    return new Promise((resolve, reject) => {
        // 生成唯一文件名
        const ext = path_1.default.extname(originalName);
        const fileName = `${(0, uuid_1.v4)()}${ext}`;
        const key = `audio/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;
        cos.putObject({
            Bucket: BUCKET,
            Region: REGION,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType
        }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            // 生成访问 URL
            const url = `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`;
            resolve({
                url,
                key,
                size: fileBuffer.length
            });
        });
    });
}
// 删除文件
async function deleteFile(key) {
    return new Promise((resolve, reject) => {
        cos.deleteObject({
            Bucket: BUCKET,
            Region: REGION,
            Key: key
        }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
// 获取文件临时访问 URL（用于私有文件）
async function getFileUrl(key, expires = 3600) {
    return new Promise((resolve, reject) => {
        cos.getObjectUrl({
            Bucket: BUCKET,
            Region: REGION,
            Key: key,
            Sign: true,
            Expires: expires
        }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data.Url);
        });
    });
}
// 批量删除文件
async function deleteFiles(keys) {
    return new Promise((resolve, reject) => {
        cos.deleteMultipleObject({
            Bucket: BUCKET,
            Region: REGION,
            Objects: keys.map(key => ({ Key: key }))
        }, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        });
    });
}
//# sourceMappingURL=storage.js.map