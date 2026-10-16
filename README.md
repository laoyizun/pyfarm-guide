# Daily Learning · 个人补课笔记系统

> 三轨独立学习（高数 / 算法 / CS 底层），配套一个本地离线笔记网站。

---

## 项目是什么

这是一个**个人补课项目**，由两部分组成：

1. **学习方法论 + 提示词**（根目录的 `.md` 文件）—— 定义怎么学、学什么、卡点怎么破
2. **笔记网站**（`笔记/` 目录）—— 纯 HTML + Node.js + SQLite 的本地离线应用，存所有课程内容和进度

### 学习者背景

- 计算机专业毕业 7 年，大学数学 / 算法基础薄弱
- 现职业：少儿编程教师
- 目标：把高数 / 算法 / CS 底层补扎实，能讲清楚、能教高中生

### 三条不可违反的原则

1. 每个知识点只问一两个费曼提问，不堆题海
2. 三轨分轨独立推进（高数 / 算法 / CS 底部分开）
3. 讲课作业一律不要，是补课不是备课

---

## 目录结构

```
Daily learning/
├── README.md                  ← 本文件
├── 索引.md                     ← 课程总览 + 进度入口
├── 01-学习者档案.md            ← 学习者画像 + 三条原则 + 进度表
├── 02-高数进度.md              ← 高数轨详细进度
├── 03-开局提示词-高数.md       ← 高数轨 AI 老师提示词
├── 04-开局提示词-算法.md       ← 算法轨 AI 老师提示词
├── 05-开局提示词-CS底层.md     ← CS 底层轨 AI 老师提示词
├── 06-自我学习教学设计.md     ← 自助学习系统（35 分钟流程 / 卡点诊断 / 费曼三判据）
├── 补课笔记网页生成提示词.md   ← 生成笔记网站的原始规格（给 AI 看的）
└── 笔记/                       ← 笔记网站（Node.js + SQLite）
    ├── server.js               Express 服务器（端口 8765）
    ├── init-db.js              数据库初始化脚本（建表 + 首批 5 节课）
    ├── package.json            依赖清单
    ├── package-lock.json
    ├── index.html              首页（三轨卡片墙 + 折叠课程列表）
    ├── lesson.html             课程阅读页（带侧边栏导航）
    ├── css/style.css           印刷感长文阅读样式（CSS Variables 驱动）
    ├── js/
    │   ├── api.js              API 调用封装
    │   ├── index.js            首页渲染（按科目折叠）
    │   ├── lesson.js           课程页渲染
    │   └── markdown.js         极简 Markdown 渲染器
    └── data/
        └── learning.db         SQLite 数据库（运行 init-db.js 后生成）
```

---

## 技术栈

| 决策 | 选择 | 理由 |
|---|---|---|
| 前端 | 纯 HTML + CSS + JS | 零依赖，离线可用 |
| 后端 | Node.js + Express | 与 SQLite 配合最简单 |
| 数据库 | SQLite（better-sqlite3） | 单文件、零配置、SQL 查询 |
| 内容存储 | SQL 数据库（不是 md 文件） | 便于查询和更新 |
| 构建工具 | 无 | 直接跑 |

---

## 在新电脑上启动

本项目原开发环境为 Windows，迁移到 **M1 MacBook（Apple Silicon / ARM64）** 时请特别注意下方第二节。

### 前置条件

- **Node.js**（v18 或更高，推荐 v20 LTS+）
- 终端（Windows: PowerShell / Mac: Terminal 或 iTerm2）

### 启动步骤（通用）

```bash
# 1. 进入笔记目录（路径用正斜杠，Mac/Windows 都适用）
cd "Daily learning/笔记"

# 2. 安装依赖
npm install

# 3. 初始化数据库（建表 + 插入首批 5 节课）
#    注意：如果 data/learning.db 已存在且数据没坏，跳过这步可保留现有进度
node init-db.js

# 4. 启动服务器
node server.js
```

浏览器打开 **http://localhost:8765**

### 常用操作

| 操作 | 命令 / 路径 |
|---|---|
| 启动 | `node server.js` |
| 重置数据库（会清空现有数据） | 删除 `data/learning.db` 后重跑 `node init-db.js` |
| 查所有科目 API | `GET http://localhost:8765/api/tracks` |
| 查所有课程 API | `GET http://localhost:8765/api/lessons` |
| 查单个课程 | `GET http://localhost:8765/api/lessons/math-01` |

---

## M1 MacBook 专属注意事项

目标机器是 Apple Silicon（M1，ARM64 架构），与原开发机（Windows x64）不同。核心差异在 native 模块编译上。

### 1. 装 Node.js（务必装 ARM64 原生版）

不要装 x64 版本再走 Rosetta 转译——会有性能损耗且 native 模块编译会出错。推荐用 Homebrew：

```bash
# 装 Homebrew（已装可跳过）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 装 Node（默认就是 ARM64 原生版）
brew install node@20
brew link --overwrite node@20

# 验证架构，输出应是 arm64
node -p "process.arch"
```

或用 nvm（方便切版本）：

```bash
brew install nvm
nvm install 20
nvm use 20
node -p "process.arch"   # 应是 arm64
```

如果 `process.arch` 输出 `x64`，说明装错了版本，卸载重装 ARM64 版。

### 2. better-sqlite3 编译（关键）

`better-sqlite3` 是 native addon（C++ 编译的二进制），**不能跨架构复制 node_modules**——这就是为什么打包时排除了它。M1 上需要本地编译，前置条件是 **Xcode Command Line Tools**：

```bash
# 装 CLT（弹窗点"安装"即可，约 1-2 GB）
xcode-select --install

# 验证
xcode-select -p   # 应输出路径，不报错
```

装完 CLT，再进 `笔记/` 跑 `npm install`，better-sqlite3 会自动从源码编译 ARM64 版本。

如果编译失败，试这几招（按顺序）：

```bash
# 招 1：清缓存重来
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 招 2：强制 rebuild native 模块
npm rebuild better-sqlite3

# 招 3：确认 python3 在（编译脚本要用）
python3 --version    # 没有就 brew install python

# 招 4：极少数情况——指定用 CLT 的 clang
npm config set python python3
npm config set msvs_version 2019   # Mac 上忽略，不报错即可
```

### 3. 数据库文件跨平台兼容

`data/learning.db` 是 SQLite 单文件，**文件格式跨架构兼容**——Windows x64 上生成的 `.db` 文件可以直接拷到 M1 上用，无需转换。但前提是 M1 上用本地编译的 better-sqlite3 去读它，而不是把 Windows 的 node_modules/better-sqlite3 拷过去。

### 4. 路径与命令差异

| 操作 | Windows | M1 Mac |
|---|---|---|
| 进目录 | `cd "C:\...\Daily learning\笔记"` | `cd "~/Daily learning/笔记"`（路径用 `~` 和 `/`） |
| 杀占用端口的进程 | `Get-Process node \| Stop-Process -Force` | `pkill node` 或 `lsof -ti:8765 \| xargs kill` |
| 列文件 | `Get-ChildItem` | `ls -la` |
| 删数据库 | `Remove-Item data/learning.db` | `rm data/learning.db` |
| 后台跑 | `Start-Process node server.js` | `node server.js &` |

### 5. M1 验证清单

迁移后依次确认：

- [ ] `node -v` ≥ 18，`node -p "process.arch"` = `arm64`
- [ ] `xcode-select -p` 不报错
- [ ] `cd 笔记 && npm install` 成功，无 better-sqlite3 报错
- [ ] `node init-db.js` 输出 "✅ 数据库初始化完成"（或保留旧 db 跳过此步）
- [ ] `node server.js` 输出 `Server: http://localhost:8765`
- [ ] 浏览器打开 `http://localhost:8765` 看到首页三轨卡片
- [ ] `http://localhost:8765/api/tracks` 返回 3 个科目 JSON

---

## 数据库结构（5 张表）

- **tracks** —— 科目（math / algo / cs）
- **lessons** —— 课程（含 markdown 正文、状态、难度、标签）
- **notes** —— 笔记（insight / block / breakthrough / review 四类）
- **progress** —— 进度（卡点、突破、下一步、学习次数）
- **cards** —— 速查卡片（公式 / 几何意义 / 反例）

详细 schema 见 `笔记/init-db.js`。

---

## 当前进度（截止 2026-08-02）

| 轨 | 课 | 状态 |
|---|---|---|
| A 高数 | 第 1 课 · 函数 | ✅ 通关 |
| A 高数 | 第 2 课 · 极限 | ⚠️ 卡在 0.999... = 1 |
| A 高数 | 第 3 课 · 导数 | ⏸ 待第 2 课过 |
| B 算法 | 第 1 课 · 二分查找 | ⏸ 待轨 A 推进 |
| C CS 底层 | 第 1 课 · 二进制 | ⏸ 待轨 A 推进 |

---

## 给 TraeWork 接手者的建议

1. **先读 `01-学习者档案.md` 和 `06-自我学习教学设计.md`** —— 了解学习者画像和自助学习系统，这是方法论基础
2. **再看 `索引.md`** —— 知道当前进度到哪了
3. **三个 `开局提示词-*.md`** 是给 AI 老师的系统提示词，每条轨一份，开局时直接喂给 AI
4. **笔记网站是工具，不是学习内容本身** —— 真正的学习发生在读教材 + 费曼自测 + 沉淀时
5. **尊重三条原则**：不堆题海、三轨独立、不布置讲课作业
6. **卡点是信号不是失败** —— 卡住时换代数 / 几何 / 类比三种角度重讲，别硬撑

---

## 排错

| 问题 | Windows 解决 | M1 Mac 解决 |
|---|---|---|
| `EADDRINUSE :8765` | `Get-Process node \| Stop-Process -Force` | `pkill node` 或 `lsof -ti:8765 \| xargs kill` |
| `better-sqlite3` 安装失败 | 装 VC++ Build Tools；确认 Node ≥ 18 | `xcode-select --install` 后 `npm rebuild better-sqlite3`；确认 `process.arch` = `arm64` |
| 数据库锁住 | 确保没有另一个 `node server.js` 在跑 | 同左 |
| 页面空白 / 404 | 确认在 `笔记/` 目录下启动，且 `data/learning.db` 存在 | 同左 |
| `process.arch` 是 x64 | 卸载 Node 重装 64 位版 | 卸载后 `brew install node@20`，装 ARM64 原生版 |

---

## 新增站点 · 编程农场指导手册

2026-10 新增。`编程农场指导手册/` 是给学生自学《The Farmer Was Replaced》（俗称《编程农场》）的 6 阶段路线，配套 NCT Python 一级学生站使用。

- **学生入口**：[`编程农场指导手册/index.html`](编程农场指导手册/)（GitHub Pages 部署后会以子目录形式上线）
- **老师答案**：[`编程农场阶段答案.md`](编程农场阶段答案.md)（**不**推 git page，留在仓库根）
- **部署文档**：[`编程农场指导手册/DEPLOY.md`](编程农场指导手册/DEPLOY.md)
- **本地预览**：`cd 编程农场指导手册 && python3 -m http.server 8088`，访问 `http://127.0.0.1:8088`

### GitHub Pages 设置（一次性）

仓库 **Settings → Pages → Build and deployment**：

- Source：`Deploy from a branch`
- Branch：`main`（或主分支名）
- **Folder：`/编程农场指导手册`** ← 选站点子目录

保存后 1–2 分钟生效，URL 形如 `https://<用户名>.github.io/<仓库名>/`。

### 一键更新

站点改完后跑一次 `编程农场指导手册/deploy.sh`，自动 add + commit + push。
