(async function() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const [lesson, allLessons, allTracks] = await Promise.all([
    API.getLesson(id),
    API.getLessons(),
    API.getTracks()
  ]);

  if (!lesson || lesson.error) {
    document.getElementById('lessonContent').innerHTML = '<div class="loading">课程不存在。</div>';
    return;
  }

  // 渲染侧边栏
  const nav = document.getElementById('sidebarNav');
  let html = '';
  allTracks.forEach(track => {
    html += `<div class="group-title" style="color:${track.color}">${track.label}</div>`;
    allLessons.filter(l => l.track_id === track.id).forEach(l => {
      const active = l.id === id ? 'active' : '';
      html += `<a href="lesson.html?id=${l.id}" class="${active}">${l.title}</a>`;
    });
  });
  nav.innerHTML = html;

  // 渲染内容
  const statusIcon = lesson.status === 'completed' ? '✅' : lesson.status === 'in-progress' ? '⚠️' : '⚪';
  const metaHtml = lesson.meta_summary ? `<div class="meta">${lesson.meta_summary.split('|').map(m => `<span>${m.trim()}</span>`).join('')}</div>` : '';
  document.getElementById('lessonContent').innerHTML = `
    <h1>${statusIcon} ${lesson.title}</h1>
    ${metaHtml}
    ${window.renderMarkdown(lesson.markdown)}
  `;
})();