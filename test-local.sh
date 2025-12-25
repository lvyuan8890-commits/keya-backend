#!/bin/bash

# 课芽本地测试脚本
# 使用方法: ./test-local.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                    课芽 - 本地测试脚本                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${RED}❌ 错误: .env 文件不存在${NC}"
    echo "请先复制 .env.example 为 .env 并填写配置"
    echo "命令: cp .env.example .env"
    exit 1
fi

echo -e "${GREEN}✅ 找到 .env 文件${NC}"
echo ""

# 步骤 1: 安装依赖
echo "📦 步骤 1/4: 安装依赖..."
npm install --production=false
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 步骤 2: 编译 TypeScript
echo "🔨 步骤 2/4: 编译 TypeScript..."
npm run build
echo -e "${GREEN}✅ 编译完成${NC}"
echo ""

# 步骤 3: 运行数据库迁移
echo "🗄️  步骤 3/4: 运行数据库迁移..."
read -p "是否运行数据库迁移? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run migrate
    echo -e "${GREEN}✅ 数据库迁移完成${NC}"
else
    echo -e "${YELLOW}⚠️  跳过数据库迁移${NC}"
fi
echo ""

# 步骤 4: 启动开发服务器
echo "🚀 步骤 4/4: 启动开发服务器..."
echo ""
echo "服务器将在 http://localhost:80 启动"
echo "健康检查: http://localhost:80/health"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
