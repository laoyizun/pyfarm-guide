/* ============================================
   编程农场指导手册 · 公共脚本
   1. 复制代码按钮
   2. 进度持久化（localStorage）
   3. 总览页 / 章节页 进度联动
   ============================================ */

(function () {
  'use strict';

  /* ---------- 1. 复制按钮 ---------- */
  function bindCopyButtons() {
    document.querySelectorAll('.code-wrap').forEach(function (wrap) {
      if (wrap.querySelector('.copy-btn')) return;
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '复制';
      btn.type = 'button';
      btn.addEventListener('click', function () {
        var pre = wrap.querySelector('pre');
        if (!pre) return;
        var text = pre.innerText;
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            fallbackCopy(text);
            done();
          });
        } else {
          fallbackCopy(text);
          done();
        }
      });
      wrap.appendChild(btn);
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 2. localStorage 进度 ---------- */
  function g(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function s(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function bindCheckboxes() {
    document.querySelectorAll('input[type="checkbox"][data-key]').forEach(function (cb) {
      var k = cb.getAttribute('data-key');
      if (!k) return;
      if (g(k) === '1') cb.checked = true;
      cb.addEventListener('change', function () {
        s(k, cb.checked ? '1' : '0');
        updateAll();
      });
    });
  }

  function updateAll() {
    updateStageProgress();
    updateOverviewProgress();
  }

  // 章节页：顶部"已会 x / y 个知识点"
  function updateStageProgress() {
    var wrap = document.querySelector('[data-stage-top]');
    if (!wrap) return;
    var total = parseInt(wrap.getAttribute('data-total') || '0', 10);
    var done = 0;
    for (var i = 1; i <= total; i++) {
      if (g(keyOf(wrap, i)) === '1') done++;
    }
    var fill = wrap.querySelector('.ch-top-fill');
    var text = wrap.querySelector('.ch-top-text');
    if (fill) fill.style.width = (total ? (done / total * 100) : 0) + '%';
    if (text) text.textContent = '已会 ' + done + ' / ' + total + ' 个知识点';
  }

  // key 规则：默认 farm_s<阶段>_k<i>；用 data-key-prefix + data-key-start 可自定义
  // 特殊订单三个子页面共用 farm_sp 前缀，靠 data-key-start 各自错开（1 / 5 / 8）
  function keyOf(el, i) {
    var prefix = el.getAttribute('data-key-prefix');
    if (!prefix) {
      var stage = el.getAttribute('data-stage-top') || el.getAttribute('data-stage-card');
      prefix = (stage === 'sp') ? 'farm_sp' : 'farm_s' + stage;
    }
    var start = parseInt(el.getAttribute('data-key-start') || '1', 10);
    return prefix + '_k' + (start + i - 1);
  }

  // 特殊订单（含拆出来的三个子页）不计入首页顶部总进度
  function isSpecial(el) {
    var stage = el.getAttribute('data-stage-card') || el.getAttribute('data-stage-top') || '';
    return stage.indexOf('sp') === 0;
  }

  // 总览页：各阶段卡进度徽标 + 顶部总进度
  function updateOverviewProgress() {
    var cards = document.querySelectorAll('[data-stage-card]');
    if (cards.length === 0) return;
    var totalAll = 0, doneAll = 0;
    cards.forEach(function (card) {
      var total = parseInt(card.getAttribute('data-total') || '0', 10);
      var done = 0;
      for (var i = 1; i <= total; i++) {
        if (g(keyOf(card, i)) === '1') done++;
      }
      // 特殊订单是独立栏目，不计入顶部总进度
      if (!isSpecial(card)) {
        totalAll += total;
        doneAll += done;
      }
      var badge = card.querySelector('.toc-prog');
      if (badge) {
        if (done > 0) {
          badge.textContent = '已会 ' + done + '/' + total;
          badge.classList.add('on');
        } else {
          badge.textContent = total + ' 个知识点';
          badge.classList.remove('on');
        }
      }
    });
    var of = document.querySelector('.prog-overview-fill');
    var ot = document.querySelector('.prog-overview-text .num');
    if (of) of.style.width = (totalAll ? (doneAll / totalAll * 100) : 0) + '%';
    if (ot) ot.textContent = doneAll;
    var otxt = document.querySelector('.prog-overview-text .total');
    if (otxt) otxt.textContent = totalAll;
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    bindCopyButtons();
    bindCheckboxes();
    updateAll();
  });
})();
