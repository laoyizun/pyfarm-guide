# 编程农场指导手册 · 部署文档

> 给老师（站点维护者）看的，学生不用管。

## 一次性 GitHub Pages 配置

**前提**：本仓库已经在 GitHub 上（remote 名通常是 `origin`）。

1. 打开 GitHub 仓库网页 → **Settings** → **Pages**（左侧菜单）
2. **Build and deployment**：
   - Source: `Deploy from a branch`
   - Branch: `main`（或你仓库的主分支名）
   - **Folder: `/编程农场指导手册`** ← **关键：选站点子目录，不要选 `/ (root)`**
3. 点 **Save**
4. 等待 1–2 分钟，刷新页面，会显示 "Your site is live at ..."

访问 URL 形如：

```
https://<你的GitHub用户名>.github.io/<仓库名>/
```

浏览器会自动跳到 `编程农场指导手册/index.html`。

## 日常更新流程

### 方式 A：一键脚本（推荐）

```bash
cd "/Users/laoyizun/TRAE项目/Daily-learning/编程农场指导手册"
./deploy.sh "fix: 修正 S3 轮作说明"
```

脚本会自动：
- 检查本地 `8088` 端口的预览服务器（不强制关）
- `git add` 站点目录 + 答案文件
- `git commit -m "<你写的 message>"`
- `git push origin main`
- 提醒你 GitHub Pages 1–2 分钟会更新

### 方式 B：手动

```bash
cd /Users/laoyizun/TRAE项目/Daily-learning
git add 编程农场指导手册/ 编程农场阶段答案.md
git commit -m "update: 阶段 5 加 2 张配图"
git push origin main
```

## 本地预览

```bash
cd "/Users/laoyizun/TRAE项目/Daily-learning/编程农场指导手册"
python3 -m http.server 8088
```

浏览器打开 http://127.0.0.1:8088/ 即可。

停止服务器：Ctrl + C，或 `lsof -ti:8088 | xargs kill`。

## 关键约定

### 1. 老师答案不上学生站

`编程农场阶段答案.md` 放在**仓库根目录**，git page 只发布 `编程农场指导手册/` 子目录，**天然安全**——学生不会从公开网址看到这个文件。

**警告**：如果你以后把 git page 源改回 `/ (root)`，答案会暴露。改源前先在 `.gitignore` 加一行：

```gitignore
编程农场阶段答案.md
```

### 2. 进度存在 localStorage

学生勾选的"已会知识点"和自查门**只存在本机浏览器**。换设备/换浏览器会丢，**这本身就是设计**（"换设备不保留"）。如果以后想云同步，需要后端服务，**本次不做**。

### 3. API 名字以游戏内文档为准

游戏版本迭代时，API 名字会变。常见差异：

- 老版本：`trade(Items.Carrot_Seed)`、`Grounds.Turf`、浇水用 `Items.Water_Tank`
- 新版本：`plant(...)` 直接扣库存、`Grounds.Grassland`、浇水用 `use_item(Items.Water)`

如果学生照老脚本跑报错，**先去游戏里按 F1 / 文档按钮查 API**。订单里给的代码基于 2026-10 时的 1.0+ 版本。

### 4. 文件命名

- 阶段页：`stage-N.html`（N = 1..6）
- 总览：`index.html`
- 答案：`编程农场阶段答案.md`（仓库根，不在站点目录里）
- 配图：`images/sN-xxx.svg`

新增阶段时：**改 `index.html` 总览 + 新建 `stage-N.html` + 更新本 DEPLOY.md**。

## 排错

| 问题 | 原因 | 解决 |
|---|---|---|
| git page 404 | Folder 选成了 `/(root)` | 改回 `/编程农场指导手册` |
| git page 显示 README | 仓库没有 `gh-pages` 分支但你配了 | 改回 `main` 分支 |
| 改动没生效 | GitHub Actions 还在跑 | 等 1–2 分钟，或看仓库 Actions 标签 |
| 答案文件被学生看到 | git page 源改成了根目录 | 立刻改回子目录，并 `.gitignore` 答案 |
| 端口 8088 占用 | 上次预览没关 | `lsof -ti:8088 \| xargs kill` |

## 学生站 URL 给到学生时

直接发 `https://<用户名>.github.io/<仓库名>/` 即可，浏览器自动落子目录。
