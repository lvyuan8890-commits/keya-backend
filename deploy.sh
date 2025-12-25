#!/bin/bash

# 课芽云托管部署脚本
# 使用方法: ./deploy.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                    课芽 - 云托管部署脚本                       ║"
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

# 检查必需的环境变量
echo "📋 检查环境变量..."
source .env

required_vars=(
    "DB_HOST"
    "DB_PASSWORD"
    "WECHAT_APP_SECRET"
    "COS_SECRET_ID"
    "COS_SECRET_KEY"
    "COS_BUCKET"
    "GEMINI_API_KEY"
    "JWT_SECRET"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"你的"* ]]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ 以下环境变量未配置或使用了默认值:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "请编辑 .env 文件并填写正确的值"
    exit 1
fi

echo -e "${GREEN}✅ 所有必需的环境变量已配置${NC}"
echo ""

# 询问是否继续
read -p "是否继续部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 0
fi

# 步骤 1: 安装依赖
echo ""
echo "📦 步骤 1/6: 安装依赖..."
npm install --production=false
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 步骤 2: 编译 TypeScript
echo ""
echo "🔨 步骤 2/6: 编译 TypeScript..."
npm run build
echo -e "${GREEN}✅ 编译完成${NC}"

# 步骤 3: 测试数据库连接
echo ""
echo "🔌 步骤 3/6: 测试数据库连接..."
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    await connection.ping();
    console.log('✅ 数据库连接成功');
    await connection.end();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
})();
"
echo -e "${GREEN}✅ 数据库连接测试通过${NC}"

# 步骤 4: 运行数据库迁移
echo ""
echo "🗄️  步骤 4/6: 运行数据库迁移..."
read -p "是否运行数据库迁移? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run migrate
    echo -e "${GREEN}✅ 数据库迁移完成${NC}"
else
    echo -e "${YELLOW}⚠️  跳过数据库迁移${NC}"
fi

# 步骤 5: 构建 Docker 镜像
echo ""
echo "🐳 步骤 5/6: 构建 Docker 镜像..."
IMAGE_NAME="keya-api"
IMAGE_TAG="latest"

docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
echo -e "${GREEN}✅ Docker 镜像构建完成${NC}"

# 步骤 6: 推送到容器镜像服务
echo ""
echo "📤 步骤 6/6: 推送到容器镜像服务..."
echo ""
echo "请按照以下步骤操作："
echo ""
echo "1. 登录腾讯云容器镜像服务:"
echo "   docker login ccr.ccs.tencentyun.com --username=你的用户名"
echo ""
echo "2. 标记镜像:"
echo "   docker tag ${IMAGE_NAME}:${IMAGE_TAG} ccr.ccs.tencentyun.com/你的命名空间/${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "3. 推送镜像:"
echo "   docker push ccr.ccs.tencentyun.com/你的命名空间/${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "4. 在微信云托管控制台部署:"
echo "   - 访问: https://cloud.weixin.qq.com/"
echo "   - 选择镜像: ccr.ccs.tencentyun.com/你的命名空间/${IMAGE_NAME}:${IMAGE_TAG}"
echo "   - 配置环境变量（复制 .env 文件内容）"
echo "   - 设置资源规格: 1核2GB, 1副本"
echo "   - 点击部署"
echo ""

read -p "是否现在推送镜像? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "请输入容器镜像服务用户名: " REGISTRY_USERNAME
    read -p "请输入命名空间: " NAMESPACE
    
    echo ""
    echo "登录容器镜像服务..."
    docker login ccr.ccs.tencentyun.com --username=${REGISTRY_USERNAME}
    
    echo ""
    echo "标记镜像..."
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ccr.ccs.tencentyun.com/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}
    
    echo ""
    echo "推送镜像..."
    docker push ccr.ccs.tencentyun.com/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}
    
    echo ""
    echo -e "${GREEN}✅ 镜像推送完成${NC}"
    echo ""
    echo "镜像地址: ccr.ccs.tencentyun.com/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
    echo ""
    echo "下一步: 在微信云托管控制台部署此镜像"
else
    echo -e "${YELLOW}⚠️  跳过镜像推送${NC}"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                      🎉 部署准备完成！                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 后续步骤:"
echo ""
echo "1. 访问微信云托管控制台: https://cloud.weixin.qq.com/"
echo "2. 创建新服务或选择现有服务"
echo "3. 选择刚才推送的镜像"
echo "4. 配置环境变量（复制 .env 文件内容）"
echo "5. 设置资源规格: 1核2GB, 1副本"
echo "6. 点击部署"
echo "7. 等待部署完成（约 2-3 分钟）"
echo "8. 测试 API: curl https://你的服务域名/health"
echo ""
echo "📚 详细文档:"
echo "   - 快速开始: ./QUICKSTART.md"
echo "   - API 文档: ./README.md"
echo "   - 前端迁移: ../FRONTEND_MIGRATION.md"
echo ""
