# 本机部署记录 · 2026-09-04

## 环境

| 项目 | 值 |
|---|---|
| 机器 | M1 MacBook（Apple Silicon，arm64） |
| Node 版本 | **v20.19.5**（Homebrew 原生 arm64，路径 `/opt/homebrew/bin/node`） |
| Xcode CLT | 已装（`/Library/Developer/CommandLineTools`） |
| SQLite | Homebrew 已装 |

## ⚠️ 与 README 不同的关键点

README 默认假设 PATH 里的 `node` 就是 ARM64 版。**本机实际有 2 套 Node**：

1. `/opt/homebrew/bin/node` → v20.19.5 / arm64 ✅（用这个）
2. `~/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/vm/tools/bin/node` → v26.3.1 / arm64（沙盒自带，**避开**）

如果用 Node 26，`better-sqlite3@11.10` 会编译失败（v8-external.h 已把 `Value()` 标 deprecated，13 个 warning + 6 个 error）。所以必须固定用 Node 20。

## 启动命令（以后都用这套）

```bash
cd "/Users/laoyizun/TRAE项目/Daily-learning/笔记"
/opt/homebrew/opt/node@20/bin/node server.js
```

或一次性把 PATH 提前：

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
cd "/Users/laoyizun/TRAE项目/Daily-learning/笔记"
npm start
```

## 数据库状态

- `data/learning.db` **已存在**，是从 Win10 一并迁移过来的，文件格式兼容，已自动加载
- 包含 3 个 tracks + 5 个 lessons（math-01~03、algo-01、cs-01），无需重跑 `init-db.js`
- 进度：math-01 ✅、math-02 ⚠️ in-progress（卡 0.999...=1）、其余 planned

## 验证结果

```
GET  /api/tracks                  → 200，3 条
GET  /api/lessons                 → 200，5 条
GET  /api/lessons/math-01         → 200，1457 字符 markdown
GET  /                            → 200，index.html 968 B
GET  /lesson.html                 → 200，701 B
GET  /css/style.css               → 200，9.4 KB
GET  /js/api.js                   → 200，1.5 KB
```

服务地址：**http://localhost:8765**

## 排错速查

| 现象 | 解决 |
|---|---|
| `better-sqlite3` 编译报 v8-external.h deprecated | 强制用 Node 20，不要用 Node 26 |
| `gyp ERR! ... EnvHttpProxyAgent` 下载头失败 | 同上 + `rm -rf ~/Library/Caches/node-gyp/26.3.1` |
| `EADDRINUSE :8765` | `lsof -ti:8765 \| xargs kill` |
| 想重置数据库 | `rm data/learning.db && /opt/homebrew/opt/node@20/bin/node init-db.js` |

## 服务器当前状态

- 命令 ID：`job-e73076c98bfb460ebca6fe8b26c01048`
- 状态：后台运行中
- 停服：`StopCommand` 或 `lsof -ti:8765 | xargs kill`
