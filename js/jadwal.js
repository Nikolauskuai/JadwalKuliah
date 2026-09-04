function scheduleMarkup(item) {
  return `
    <article class="schedule-card">
      <div class="schedule-card-top">
        <span class="day-label">${item.hari}</span>
        <span class="time">${item.mulai} - ${item.selesai}</span>
      </div>
      <h3>${item.nama}</h3>
      <span class="course-code">${item.kode}</span>
      <div class="schedule-meta">
        <span>${item.sks} SKS</span>
        <span>Kelas ${item.kelas}</span>
        <span>Ruang ${item.ruang}</span>
      </div>
    </article>
  `;
}

function renderJadwal(day = 'all') {
  const list = document.getElementById('scheduleList');

  if (!list) {
    return;
  }

  const filtered = day === 'all'
    ? jadwalKuliah
    : jadwalKuliah.filter(item => item.hari === day);

  list.innerHTML = filtered.map(scheduleMarkup).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-day]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-day]').forEach(item => {
        item.classList.remove('active');
      });

      button.classList.add('active');
      renderJadwal(button.dataset.day);
    });
  });
});
