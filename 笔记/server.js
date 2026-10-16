const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'data', 'learning.db'));

app.use(express.json());
app.use(express.static(__dirname));

// API 路由
app.get('/api/tracks', (req, res) => {
  const tracks = db.prepare('SELECT * FROM tracks ORDER BY sort_order').all();
  res.json(tracks);
});

app.get('/api/tracks/:id', (req, res) => {
  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!track) return res.status(404).json({ error: 'Not found' });
  const lessons = db.prepare('SELECT * FROM lessons WHERE track_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ ...track, lessons });
});

app.get('/api/lessons', (req, res) => {
  const { track, status } = req.query;
  let sql = 'SELECT * FROM lessons WHERE 1=1';
  const params = [];
  if (track) { sql += ' AND track_id = ?'; params.push(track); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY track_id, sort_order';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/lessons/:id', (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Not found' });
  res.json(lesson);
});

app.get('/api/lessons/:id/notes', (req, res) => {
  const notes = db.prepare('SELECT * FROM notes WHERE lesson_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(notes);
});

app.post('/api/lessons', (req, res) => {
  const data = req.body;
  const tags = typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || []);
  const prereq = typeof data.prerequisites === 'string' ? data.prerequisites : JSON.stringify(data.prerequisites || []);
  try {
    const info = db.prepare(`INSERT INTO lessons
      (id, track_id, track_label, track_color, title, subtitle, status, difficulty, estimated_minutes, chapter, meta_summary, sort_order, tags, prerequisites, markdown)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      data.id, data.track_id, data.track_label || '', data.track_color || '',
      data.title, data.subtitle || '', data.status || 'planned',
      data.difficulty || 1, data.estimated_minutes || 60, data.chapter || '',
      data.meta_summary || '', data.sort_order || 0, tags, prereq, data.markdown || ''
    );
    res.json({ ok: true, id: data.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/lessons/:id', (req, res) => {
  const data = req.body;
  const tags = typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || []);
  const prereq = typeof data.prerequisites === 'string' ? data.prerequisites : JSON.stringify(data.prerequisites || []);
  try {
    db.prepare(`UPDATE lessons SET
      title = ?, subtitle = ?, status = ?, difficulty = ?, estimated_minutes = ?,
      chapter = ?, meta_summary = ?, sort_order = ?, tags = ?, prerequisites = ?,
      markdown = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`).run(
      data.title, data.subtitle || '', data.status || 'planned', data.difficulty || 1,
      data.estimated_minutes || 60, data.chapter || '', data.meta_summary || '',
      data.sort_order || 0, tags, prereq, data.markdown || '', req.params.id
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/lessons/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM lessons WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/notes', (req, res) => {
  const { lesson_id, type, content, tags } = req.body;
  const tagsStr = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
  try {
    const info = db.prepare(`INSERT INTO notes (lesson_id, type, content, tags) VALUES (?, ?, ?, ?)`).run(
      lesson_id, type || 'insight', content, tagsStr
    );
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/progress/all', (req, res) => {
  const rows = db.prepare(`
    SELECT l.id, l.title, l.track_id, l.track_label, l.track_color, l.status,
           p.blocks, p.breakthrough, p.next_step, p.session_count, p.last_studied
    FROM lessons l LEFT JOIN progress p ON l.id = p.lesson_id
    ORDER BY l.track_id, l.sort_order
  `).all();
  res.json(rows);
});

app.get('/api/cards', (req, res) => {
  const { track } = req.query;
  let sql = 'SELECT * FROM cards';
  const params = [];
  if (track) { sql += ' WHERE track_id = ?'; params.push(track); }
  sql += ' ORDER BY id DESC';
  res.json(db.prepare(sql).all(...params));
});

// 启动
const PORT = 8765;
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API:    http://localhost:${PORT}/api/tracks`);
});