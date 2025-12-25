FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制所有文件（包括已编译的 dist 目录）
COPY . .

# 只安装生产依赖
RUN npm install --omit=dev

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["npm", "start"]
