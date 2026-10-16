(async function() {
  const tracks = await API.getTracks();
  const lessons = await API.getLessons();

  const trackGrid = document.getElementById('trackGrid');
  const allLessonsEl = document.getElementById('allLessons');

  // 顶部：科目卡片墙
  tracks.forEach(track => {
    const trackLessons = lessons.filter(l => l.track_id === track.id);
    const completed = trackLessons.filter(l => l.status === 'completed').length;
    const inProgress = trackLessons.filter(l => l.status === 'in-progress').length;
    const card = document.createElement('div');
    card.className = 'track-card';
    card.style.setProperty('--track-color', track.color);
    card.style.setProperty('background', track.bg);
    card.innerHTML = `
      <div class="track-label" style="color:${track.color}">${track.label}</div>
      <h3>${track.desc}</h3>
      <p class="track-desc">${trackLessons.length} 节课 · ✅ ${completed} · ⚠️ ${inProgress}</p>
      <div class="track-meta">
        ${trackLessons.map(l => `<span>${l.id}: ${l.status}</span>`).join('')}
      </div>
    `;
    trackGrid.appendChild(card);
  });

  // 底部：按科目折叠的课程列表
  tracks.forEach(track => {
    const trackLessons = lessons.filter(l => l.track_id === track.id);
    const group = document.createElement('details');
    group.className = 'lesson-group';
    group.style.setProperty('--track-color', track.color);
    // 默认折叠

    let lessonsHtml = '';
    if (trackLessons.length === 0) {
      lessonsHtml = '<div class="lesson-empty">暂无课程</div>';
    } else {
      trackLessons.forEach(l => {
        const statusIcon = l.status === 'completed' ? '✅' : l.status === 'in-progress' ? '⚠️' : '⚪';
        lessonsHtml += `
          <a href="lesson.html?id=${l.id}" class="lesson-card" style="border-left:3px solid ${l.track_color}">
            <span class="badge" style="background:${l.track_color}11;color:${l.track_color}">${l.track_label}</span>
            <h4>${statusIcon} ${l.title}</h4>
            <p>${l.subtitle || ''}</p>
          </a>
        `;
      });
    }

    group.innerHTML = `
      <summary style="border-left:4px solid ${track.color}">
        <span class="lesson-group-label" style="color:${track.color}">${track.label}</span>
        <span class="lesson-group-meta">${trackLessons.length} 节课</span>
        <span class="lesson-group-arrow">▾</span>
      </summary>
      <div class="lesson-group-body">${lessonsHtml}</div>
    `;
    allLessonsEl.appendChild(group);
  });
})();