/* ============================================
   编程农场指导手册 · 荣誉弹窗
   首个完成三个进阶挑战、解锁《编程矿场》DLC 的同学
   ============================================ */

(function () {
  'use strict';

  var SEEN_KEY = 'farm_celebrate_fan_v1';
  var CONFETTI_COLORS = ['#F3A21C', '#E8830C', '#3a6b3a', '#3b6fb1', '#b85050', '#7d4f9a', '#2a8a8a'];

  /* ---------- 撒彩纸 ---------- */
  function dropConfetti(card) {
    var count = 46;
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = (Math.random() * 100) + '%';
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.animationDuration = (2.1 + Math.random() * 1.9) + 's';
      piece.style.animationDelay = (Math.random() * 0.9) + 's';
      piece.style.width = (6 + Math.random() * 7) + 'px';
      piece.style.height = (10 + Math.random() * 10) + 'px';
      if (Math.random() > 0.5) piece.style.borderRadius = '50%';
      card.appendChild(piece);
      (function (el) {
        setTimeout(function () {
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 4600);
      })(piece);
    }
  }

  /* ---------- 开关 ---------- */
  function openCelebrate(mask) {
    var card = mask.querySelector('.celebrate-card');
    mask.classList.add('on');
    document.body.style.overflow = 'hidden';
    if (card) dropConfetti(card);
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
  }

  function closeCelebrate(mask) {
    mask.classList.remove('on');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var mask = document.querySelector('.celebrate-mask');
    if (!mask) return;

    // 关闭按钮 / 点遮罩空白处
    mask.addEventListener('click', function (e) {
      if (e.target === mask) {
        closeCelebrate(mask);
        return;
      }
      if (e.target.closest && e.target.closest('[data-celebrate-close]')) {
        closeCelebrate(mask);
      }
    });

    // Esc 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mask.classList.contains('on')) closeCelebrate(mask);
    });

    // 首页上的"荣誉榜"入口 —— 随时可以再打开看
    var trigger = document.querySelector('.celebrate-trigger');
    if (trigger) {
      trigger.addEventListener('click', function () {
        openCelebrate(mask);
      });
    }

    // 首次访问自动弹出
    var seen = null;
    try { seen = localStorage.getItem(SEEN_KEY); } catch (e) {}
    if (!seen) {
      setTimeout(function () { openCelebrate(mask); }, 700);
    }
  });
})();
