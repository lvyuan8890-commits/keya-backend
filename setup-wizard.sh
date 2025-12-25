#!/bin/bash

# 课芽云托管配置向导
# 使用方法: ./setup-wizard.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                  课芽 - 云托管配置向导                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 检查是否已有 .env 文件
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  检测到已存在 .env 文件${NC}"
    read -p "是否覆盖现有配置? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "配置已取消"
        exit 0
    fi
    mv .env .env.backup
    echo -e "${GREEN}✅ 已备份现有配置到 .env.backup${NC}"
    echo ""
fi

# 创建 .env 文件
cp .env.example .env

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📝 开始配置向导${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 云托管环境ID（已知）
echo -e "${GREEN}✅ 云托管环境ID: intj-1g1za1ic368b7b3d${NC}"
echo ""

# 2. 数据库配置
echo -e "${CYAN}━━━ 1/5 数据库配置 ━━━${NC}"
echo ""
read -p "数据库地址 (DB_HOST): " DB_HOST
read -p "数据库密码 (DB_PASSWORD): " DB_PASSWORD
echo ""

# 3. COS 配置
echo -e "${CYAN}━━━ 2/5 对象存储配置 ━━━${NC}"
echo ""
read -p "COS SecretId: " COS_SECRET_ID
read -p "COS SecretKey: " COS_SECRET_KEY
read -p "COS 存储桶名称 (例如: keya-audio-12345678): " COS_BUCKET
echo ""

# 4. 微信配置
echo -e "${CYAN}━━━ 3/5 微信小程序配置 ━━━${NC}"
echo ""
read -p "微信 AppSecret: " WECHAT_APP_SECRET
echo ""

# 5. Gemini API
echo -e "${CYAN}━━━ 4/5 Gemini API 配置 ━━━${NC}"
echo ""
read -p "Gemini API Key (可选，按回车跳过): " GEMINI_API_KEY
echo ""

# 6. JWT Secret
echo -e "${CYAN}━━━ 5/5 JWT 配置 ━━━${NC}"
echo ""
echo "正在生成 JWT Secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ JWT Secret 已生成${NC}"
echo ""

# 写入配置
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}💾 正在保存配置...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > .env << EOF
# 环境变量配置

# 服务端口
PORT=80

# 云托管环境ID
CLOUD_ENV_ID=intj-1g1za1ic368b7b3d

# 数据库配置
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_USER=root
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=keya

# JWT 配置
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APP_ID=wx2d2fd7564bb59a79
WECHAT_APP_SECRET=${WECHAT_APP_SECRET}

# 腾讯云 COS 配置
COS_SECRET_ID=${COS_SECRET_ID}
COS_SECRET_KEY=${COS_SECRET_KEY}
COS_BUCKET=${COS_BUCKET}
COS_REGION=ap-shanghai

# Gemini API 配置
GEMINI_API_KEY=${GEMINI_API_KEY}

# 日志级别
LOG_LEVEL=info

# 环境
NODE_ENV=production
EOF

echo -e "${GREEN}✅ 配置已保存到 .env 文件${NC}"
echo ""

# 显示配置摘要
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 配置摘要${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "云托管环境ID: intj-1g1za1ic368b7b3d"
echo "数据库地址: ${DB_HOST}"
echo "COS 存储桶: ${COS_BUCKET}"
echo "微信 AppID: wx2d2fd7564bb59a79"
if [ -n "$GEMINI_API_KEY" ]; then
    echo "Gemini API: 已配置"
else
    echo "Gemini API: 未配置（可后续添加）"
fi
echo ""

# 验证配置
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 验证配置${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查必需字段
missing_fields=()

if [ -z "$DB_HOST" ]; then
    missing_fields+=("DB_HOST")
fi

if [ -z "$DB_PASSWORD" ]; then
    missing_fields+=("DB_PASSWORD")
fi

if [ -z "$WECHAT_APP_SECRET" ]; then
    missing_fields+=("WECHAT_APP_SECRET")
fi

if [ -z "$COS_SECRET_ID" ]; then
    missing_fields+=("COS_SECRET_ID")
fi

if [ -z "$COS_SECRET_KEY" ]; then
    missing_fields+=("COS_SECRET_KEY")
fi

if [ -z "$COS_BUCKET" ]; then
    missing_fields+=("COS_BUCKET")
fi

if [ ${#missing_fields[@]} -ne 0 ]; then
    echo -e "${RED}❌ 以下必需字段未填写:${NC}"
    for field in "${missing_fields[@]}"; do
        echo "   - $field"
    done
    echo ""
    echo "请编辑 .env 文件并填写缺失的字段"
    exit 1
fi

echo -e "${GREEN}✅ 所有必需字段已填写${NC}"
echo ""

# 询问下一步
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 下一步操作${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "配置已完成！您可以选择："
echo ""
echo "1. 运行本地测试"
echo "2. 直接部署到云托管"
echo "3. 退出（稍后手动操作）"
echo ""
read -p "请选择 (1/2/3): " -n 1 -r
echo
echo ""

case $REPLY in
    1)
        echo -e "${CYAN}正在启动本地测试...${NC}"
        echo ""
        ./test-local.sh
        ;;
    2)
        echo -e "${CYAN}正在启动部署流程...${NC}"
        echo ""
        ./deploy.sh
        ;;
    3)
        echo -e "${GREEN}配置完成！${NC}"
        echo ""
        echo "您可以稍后运行以下命令："
        echo "  - 本地测试: ./test-local.sh"
        echo "  - 部署: ./deploy.sh"
        echo ""
        ;;
    *)
        echo -e "${YELLOW}无效选择，退出${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║                      配置向导完成！                            ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
