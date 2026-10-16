#!/usr/bin/env bash
# ============================================
# 编程农场指导手册 · 一键更新脚本
# 用法：./deploy.sh "你的提交说明"
# 留空则用默认说明
# ============================================
set -e

# 切到仓库根（脚本在 编程农场指导手册/ 子目录里）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# 提交说明
MSG="${1:-update: 编程农场指导手册站点更新}"

echo "📍 仓库根：$REPO_ROOT"
echo "📝 提交说明：$MSG"
echo ""

# 1. 检查 git 状态
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 这不是一个 git 仓库。先在 GitHub 上建仓，再 git remote add origin <URL>"
    exit 1
fi

# 2. 检查 remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ 没配 remote origin。先 git remote add origin <GitHub 仓库 URL>"
    exit 1
fi

echo "🔍 改动文件："
git status --short 编程农场指导手册/ 编程农场阶段答案.md
echo ""

# 3. 拉取远端（避免冲突）
echo "⬇️  拉取远端 main..."
git pull --rebase --autostash origin main 2>&1 | tail -5 || true
echo ""

# 4. 添加文件
echo "➕ 添加文件..."
git add 编程农场指导手册/
git add 编程农场阶段答案.md 2>/dev/null || true   # 答案可能在仓库根也可能不存在
echo ""

# 5. 检查有没有东西要提交
if git diff --cached --quiet; then
    echo "ℹ️  没有改动要提交"
    exit 0
fi

# 6. 提交
echo "💾 提交..."
git commit -m "$MSG"
echo ""

# 7. 推送
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"
echo "🚀 推送到 origin/$BRANCH..."
git push origin "$BRANCH"
echo ""

# 8. 提示
cat <<'EOF'
✅ 推送完成

📡 GitHub Pages 一般 1–2 分钟内自动更新。
   访问 https://<用户名>.github.io/<仓库名>/ 即可

   查部署状态：GitHub 仓库 → Actions 标签
EOF
