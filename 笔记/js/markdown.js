// 极简 Markdown 渲染器
// 支持：标题、段落、粗体、行内代码、代码块、列表、有序列表、引用、表格、水平线、Callout 容器

(function() {
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderInline(text) {
    // 先把代码块抠掉
    const codeStash = [];
    text = text.replace(/`([^`]+)`/g, function(_, c) {
      codeStash.push(c);
      return '\u0000CODE' + (codeStash.length - 1) + '\u0000';
    });
    // 转义剩余
    text = escapeHtml(text);
    // 粗体 **xxx**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // 斜体 *xxx*
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // 还原代码
    text = text.replace(/\u0000CODE(\d+)\u0000/g, function(_, i) {
      return '<code>' + escapeHtml(codeStash[+i]) + '</code>';
    });
    return text;
  }

  function render(src) {
    const lines = src.split('\n');
    const out = [];
    let i = 0;

    function flushList(type) {
      // 简单处理：之前累积的列表段已经在 out 里直接闭合
    }

    while (i < lines.length) {
      const line = lines[i];

      // 代码块 ```
      if (/^```/.test(line)) {
        const lang = line.replace(/^```/, '').trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; // 跳过结束的 ```
        const langLabel = lang ? `<div style="font-size:11px;color:#999;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">${lang}</div>` : '';
        out.push('<pre>' + langLabel + '<code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
        continue;
      }

      // Callout ::: callout feynman ... :::
      if (/^:::/.test(line)) {
        const m = line.match(/^:::\s*(\w+)\s*(\w+)?/);
        const variant = (m && m[2]) || 'feynman';
        const buf = [];
        i++;
        while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++; // skip :::
        out.push('<div class="callout ' + variant + '">' + render(buf.join('\n')) + '</div>');
        continue;
      }

      // 标题
      const h = line.match(/^(#{1,6})\s+(.+)$/);
      if (h) {
        const level = h[1].length;
        out.push('<h' + level + '>' + renderInline(h[2]) + '</h' + level + '>');
        i++;
        continue;
      }

      // 水平线
      if (/^---+$/.test(line.trim())) {
        out.push('<hr>');
        i++;
        continue;
      }

      // 引用
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + render(buf.join('\n')) + '</blockquote>');
        continue;
      }

      // 表格（含表头分隔行 | --- | --- |）
      if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1])) {
        const parseRow = (l) => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const headers = parseRow(line);
        i += 2; // skip header + 分隔行
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) {
          rows.push(parseRow(lines[i]));
          i++;
        }
        let t = '<table><thead><tr>';
        headers.forEach(h => t += '<th>' + renderInline(h) + '</th>');
        t += '</tr></thead><tbody>';
        rows.forEach(r => {
          t += '<tr>';
          r.forEach(c => t += '<td>' + renderInline(c) + '</td>');
          t += '</tr>';
        });
        t += '</tbody></table>';
        out.push(t);
        continue;
      }

      // 无序列表
      if (/^[-*]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          buf.push(lines[i].replace(/^[-*]\s+/, ''));
          i++;
        }
        out.push('<ul>' + buf.map(b => '<li>' + renderInline(b) + '</li>').join('') + '</ul>');
        continue;
      }

      // 有序列表
      if (/^\d+\.\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          buf.push(lines[i].replace(/^\d+\.\s+/, ''));
          i++;
        }
        out.push('<ol>' + buf.map(b => '<li>' + renderInline(b) + '</li>').join('') + '</ol>');
        continue;
      }

      // 复选框 - [ ] / - [x]
      if (/^-\s\[[ x]\]\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^-\s\[[ x]\]\s+/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        out.push('<ul>' + buf.map(b => {
          const m = b.match(/^-\s\[([ x])\]\s+(.+)$/);
          const checked = m[1] === 'x' ? '☑' : '☐';
          return '<li>' + checked + ' ' + renderInline(m[2]) + '</li>';
        }).join('') + '</ul>');
        continue;
      }

      // 空行
      if (line.trim() === '') {
        i++;
        continue;
      }

      // 普通段落（合并连续行）
      const buf = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|>|```|---|\||:::|[-*]\s|\d+\.\s|-\s\[)/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      out.push('<p>' + renderInline(buf.join(' ')) + '</p>');
    }

    return out.join('\n');
  }

  window.renderMarkdown = render;
})();