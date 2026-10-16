const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

const db = new Database(path.join(dbDir, 'learning.db'));

// 建表
db.exec(`
CREATE TABLE tracks (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  desc TEXT,
  color TEXT,
  bg TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  track_label TEXT,
  track_color TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  status TEXT CHECK(status IN ('planned', 'in-progress', 'completed')) DEFAULT 'planned',
  difficulty INTEGER DEFAULT 1,
  estimated_minutes INTEGER DEFAULT 60,
  chapter TEXT,
  meta_summary TEXT,
  markdown TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  prerequisites TEXT,
  tags TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id TEXT,
  type TEXT CHECK(type IN ('insight', 'block', 'breakthrough', 'review')) DEFAULT 'insight',
  content TEXT NOT NULL,
  tags TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id TEXT NOT NULL,
  status TEXT,
  blocks TEXT,
  breakthrough TEXT,
  next_step TEXT,
  session_count INTEGER DEFAULT 0,
  last_studied TEXT,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track_id TEXT,
  category TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id)
);

CREATE INDEX idx_lessons_track ON lessons(track_id);
CREATE INDEX idx_lessons_status ON lessons(status);
CREATE INDEX idx_notes_lesson ON notes(lesson_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
`);

// 初始化 tracks
const tracks = [
  { id: 'math', label: 'A · 高等数学', desc: '从函数、极限、导数开始', color: '#c8462f', bg: 'rgba(200,70,47,0.08)', sort_order: 1 },
  { id: 'algo', label: 'B · 数据结构与算法', desc: '《算法图解》+ Python 代码', color: '#3b6e8f', bg: 'rgba(59,110,143,0.08)', sort_order: 2 },
  { id: 'cs',   label: 'C · 计算机原理 / 底层', desc: '二进制、内存、CPU、OS、网络', color: '#2f7d52', bg: 'rgba(47,125,82,0.08)', sort_order: 3 }
];

const insertTrack = db.prepare('INSERT INTO tracks (id, label, desc, color, bg, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
tracks.forEach(t => insertTrack.run(t.id, t.label, t.desc, t.color, t.bg, t.sort_order));

// 初始化 lessons（首批 5 个）
const lessons = [
  {
    id: 'math-01',
    track_id: 'math',
    track_label: 'A · 高等数学',
    track_color: '#c8462f',
    title: '第 1 课 · 函数到底是什么',
    subtitle: '三件套 + 封装，把函数讲透',
    status: 'completed',
    difficulty: 2,
    estimated_minutes: 60,
    chapter: '第 1 章',
    meta_summary: '⏱ 60 分钟 | 📍 第 1 章 | 🧠 直觉优先',
    sort_order: 1,
    tags: JSON.stringify(['函数', '封装', '对应关系']),
    markdown: `# 第 1 课 · 函数到底是什么

> 三件套 + 封装，把函数讲透。

## 这一课要会什么

到这一课结束，你应该能用**自己的话**回答这三个：

1. 什么是函数？（不背定义）
2. 为什么 \`x² + y² = 1\`（一个圆）**不是**函数？
3. 函数的图像是什么？图像上怎么看定义域、值域？

## 一、函数 = 两个集合 + 一条对应规则

把函数拆成三件看得见的东西：

| 名称 | 含义 | 数学记号 |
|---|---|---|
| 定义域 | 所有可能的输入 | X |
| 值域 | 所有可能的输出 | Y |
| 对应规则 | 每个 x 必须**只能**对应一个 y | f |

最关键的只有一句话：**每个 x 必须且只能对应一个 y**。这就是函数的"灵魂"。

### 最朴素的例子

\`\`\`
f(x) = x²
\`\`\`

- 塞 x = 1，出来 y = 1
- 塞 x = 2，出来 y = 4
- 塞 x = -2，出来 y = 4

注意：**多个 x 可以对应同一个 y**（1 和 -1 都给 1），但**一个 x 不能对应多个 y**。

## 二、为什么圆不是函数？

\`x² + y² = 1\` 是单位圆。

问题：塞 x = 0 进去，能得到几个 y？

\`\`\`python
0 + y² = 1
y² = 1
y = ±1
\`\`\`

两个答案：y = 1 和 y = -1。**一个 x 给出两个 y**，违反函数的灵魂——所以圆不是函数。

反过来，"上半圆" \`y = √(1 - x²)\` 只取正根号，**每个 x 只能给一个 y**——它就是函数。

## 三、函数的图像

把每对 (x, f(x)) 在坐标系上画出来，就是图像。

图像上能直接读出三件事：
- 定义域：x 取了什么值
- 值域：y 取了什么值
- 对应规则：每条 x 垂线只和图像交一个点

## 四、核心：封装 + 复用

::: callout feynman
**这一节最重要。** 函数在工程里真正值钱的地方，不是"对应关系"——而是**封装**。
:::

把"做番茄炒蛋"想象成函数：

\`\`\`python
def tomato_egg(servings):
    eggs = servings * 2
    tomato = servings * 1
    return f"{eggs} 个鸡蛋 + {tomato} 个番茄"

tomato_egg(3)    # 做 3 份
tomato_egg(100)  # 做 100 份，代码不增一行
\`\`\`

## 五、Python 的 def = 数学的 f(x)

| 概念 | Python | 数学 |
|---|---|---|
| 定义函数 | \`def f(x):\` | \`f(x) = ...\` |
| 调用函数 | \`f(3)\` | \`f(3)\` |
| 参数 | \`x\` | \`x\` |
| 返回值 | \`return y\` | \`y\` 或 \`f(x)\` |

## 🔔 费曼提问

> 为什么 \`x² + y² = 1\`（一个圆）不是函数？反过来，"上半圆" \`y = √(1 - x²)\` 是函数吗？为什么？

## 课后一句话总结

> **函数 = 三件套（定义域 + 值域 + 对应规则），灵魂是封装。**
> **判断是不是函数：每个 x 只能对应一个 y。**`
  },
  {
    id: 'math-02',
    track_id: 'math',
    track_label: 'A · 高等数学',
    track_color: '#c8462f',
    title: '第 2 课 · 极限不是玄学',
    subtitle: '芝诺乌龟 + 切鸡蛋的哲学',
    status: 'in-progress',
    difficulty: 3,
    estimated_minutes: 60,
    chapter: '第 2 章',
    meta_summary: '⏱ 60 分钟 | 📍 第 2 章 | 🎯 为导数铺路',
    sort_order: 2,
    tags: JSON.stringify(['极限', 'ε-δ', '0.999']),
    markdown: `# 第 2 课 · 极限不是玄学

> ⚠️ 进行中 · 卡在"0.999... = 1 的证明"

## 进度

- ✅ 已通过：极限是"无限接近但不等于"
- ✅ 已通过：ε-δ 语言（ε 是输入，δ 是输出）
- ✅ 已通过：代数证明（等比求和）
- ✅ 已通过：打靶反证法
- ⚠️ **卡点**：从"连续性"到"0.999... = 1"的推理
  - 具体是 d₁ = d/10（距离不断缩小）和"连续性导致 d 没地方待"两个点的连接

## TODO

- [ ] 用最朴素的几何讲法重讲这个推理
- [ ] 一旦通过，进导数`
  },
  {
    id: 'math-03',
    track_id: 'math',
    track_label: 'A · 高等数学',
    track_color: '#c8462f',
    title: '第 3 课 · 导数 = 变化率',
    subtitle: '速度、加速度、代码性能曲线',
    status: 'planned',
    difficulty: 3,
    estimated_minutes: 60,
    sort_order: 3,
    tags: JSON.stringify(['导数', '变化率']),
    markdown: `# 第 3 课 · 导数 = 变化率

> ⚪ 暂未开始

待第 2 课通关后开启。`
  },
  {
    id: 'algo-01',
    track_id: 'algo',
    track_label: 'B · 数据结构与算法',
    track_color: '#3b6e8f',
    title: '第 1 课 · 二分查找',
    subtitle: '《算法图解》Ch 1',
    status: 'planned',
    difficulty: 2,
    estimated_minutes: 60,
    chapter: '第 1 章',
    meta_summary: '⏱ 60 分钟 | 📍 第 1 章 | 🔍 O(log n)',
    sort_order: 1,
    tags: JSON.stringify(['二分', 'O(log n)']),
    markdown: `# 第 1 课 · 二分查找

> ⚪ 暂未开始

跟《算法图解》Ch 1。`
  },
  {
    id: 'cs-01',
    track_id: 'cs',
    track_label: 'C · 计算机原理 / 底层',
    track_color: '#2f7d52',
    title: '第 1 课 · 二进制：计算机的语言',
    subtitle: '为什么 0 和 1 能撑起整个数字世界',
    status: 'planned',
    difficulty: 2,
    estimated_minutes: 60,
    chapter: '第 1 章',
    meta_summary: '⏱ 60 分钟 | 📍 第 1 章',
    sort_order: 1,
    tags: JSON.stringify(['二进制', '位运算']),
    markdown: `# 第 1 课 · 二进制：计算机的语言

> ⚪ 暂未开始

从"为什么计算机只懂 0 和 1"开始。`
  }
];

const insertLesson = db.prepare(`INSERT INTO lessons
  (id, track_id, track_label, track_color, title, subtitle, status, difficulty, estimated_minutes, chapter, meta_summary, sort_order, tags, markdown)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

lessons.forEach(l => {
  insertLesson.run(
    l.id, l.track_id, l.track_label || '', l.track_color || '', l.title, l.subtitle || '', l.status,
    l.difficulty || 1, l.estimated_minutes || 60, l.chapter || '', l.meta_summary || '',
    l.sort_order, l.tags || '[]', l.markdown
  );
});

console.log('✅ 数据库初始化完成');
console.log(`📁 位置: ${path.join(dbDir, 'learning.db')}`);
console.log(`📚 tracks: ${tracks.length}`);
console.log(`📖 lessons: ${lessons.length}`);