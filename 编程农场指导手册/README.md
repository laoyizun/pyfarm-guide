# 编程农场 · 学生自学路线

> 用《The Farmer Was Replaced》（俗称《编程农场》）练 Python 语法的 6 阶段路线。  
> 配套 NCT Python 一级学生站使用，**答案代码不放在站点里**——先自己想，再问老师。

## 怎么用

1. 从 S1 开始，按顺序学
2. 每个订单做完再进下一阶段
3. 知识点和自查门的勾会**记在你本机浏览器**（localStorage），换设备不保留

## 目录结构

```
编程农场指导手册/
├── index.html              ← 路线总览（6 张阶段卡 + 进度条 + 节奏表）
├── stage-1.html            ← 让无人机活着（while / if）
├── stage-2.html            ← 算一算再种田（运算符 / 取余）
├── stage-3.html            ← 把数据存起来（列表）
├── stage-4.html            ← 拆出可复用的函数
├── stage-5.html            ← 排序算法
├── stage-6.html            ← 迷宫 + 恐龙帽
├── css/farm.css            ← 沿用课设橙主题
├── js/main.js              ← 复制按钮 + 进度持久化
├── images/                 ← 配图（SVG 矢量）
│   ├── s2-checkerboard.svg
│   ├── s3-rotation.svg
│   └── s6-maze-wallfollow.svg
├── DEPLOY.md               ← 老师部署文档（学生不用看）
├── deploy.sh               ← 一键更新脚本（老师用）
└── preview-figures.html    ← 本地预览页（gitignore 排除，不上线）
```

## 老师专属

- 答案：仓库根的 `编程农场阶段答案.md`（**不**上 git page）
- 部署：看 [DEPLOY.md](DEPLOY.md)
- 一键更新：跑 `./deploy.sh "说明文字"`
