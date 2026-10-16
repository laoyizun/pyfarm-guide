const API = {
  async getTracks() { return fetch('/api/tracks').then(r => r.json()); },
  async getTrack(id) { return fetch('/api/tracks/' + id).then(r => r.json()); },
  async getLessons(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return fetch('/api/lessons' + (qs ? '?' + qs : '')).then(r => r.json());
  },
  async getLesson(id) { return fetch('/api/lessons/' + id).then(r => r.json()); },
  async getNotes(lessonId) { return fetch('/api/lessons/' + lessonId + '/notes').then(r => r.json()); },
  async createLesson(data) {
    return fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  async updateLesson(id, data) {
    return fetch('/api/lessons/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  async deleteLesson(id) {
    return fetch('/api/lessons/' + id, { method: 'DELETE' }).then(r => r.json());
  },
  async createNote(data) {
    return fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  },
  async getProgressAll() { return fetch('/api/progress/all').then(r => r.json()); },
  async getCards(track) {
    const qs = track ? '?track=' + track : '';
    return fetch('/api/cards' + qs).then(r => r.json());
  }
};