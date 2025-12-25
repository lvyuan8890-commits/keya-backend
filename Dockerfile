FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 只复制 package.json，避免 lock 文件兼容性问题
COPY package.json ./

# 安装所有依赖（不仅是生产依赖，确保万无一失）
RUN npm install

# 复制编译后的代码
COPY dist ./dist

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/app.js"]
