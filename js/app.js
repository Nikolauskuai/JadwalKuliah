const AUTH_KEY = 'nk_auth';
const DARK_KEY = 'nk_dark';
const NOTIFICATION_KEY = 'nk_last_class_notification';
let nextClassTimer;

const jadwalKuliah = [
  {
    hari: 'Senin',
    mulai: '09:31',
    selesai: '12:00',
    nama: 'Logika Fuzzy',
    kode: 'INF26052',
    sks: 3,
    kelas: '12D',
    ruang: 'F204'
  },
  {
    hari: 'Selasa',
    mulai: '12:01',
    selesai: '14:30',
    nama: 'Analisis dan Perancangan Sistem',
    kode: 'INF26053',
    sks: 3,
    kelas: '12D',
    ruang: 'MKRT-104'
  },
  {
    hari: 'Rabu',
    mulai: '09:31',
    selesai: '12:00',
    nama: 'Kalkulus',
    kode: 'INF26035',
    sks: 3,
    kelas: '12D',
    ruang: 'F206'
  },
  {
    hari: 'Rabu',
    mulai: '12:01',
    selesai: '14:30',
    nama: 'Komputer Grafik',
    kode: 'INF26054',
    sks: 3,
    kelas: '12D',
    ruang: 'F206'
  },
  {
    hari: 'Rabu',
    mulai: '15:21',
    selesai: '17:00',
    nama: 'Komputer dan Masyarakat',
    kode: 'FTI26022',
    sks: 2,
    kelas: '12D',
    ruang: 'MKRT-206'
  },
  {
    hari: 'Kamis',
    mulai: '07:51',
    selesai: '09:30',
    nama: 'Metodologi Riset Teknologi Informasi',
    kode: 'INF26055',
    sks: 2,
    kelas: '12D',
    ruang: 'MKRT-301'
  },
  {
    hari: 'Kamis',
    mulai: '15:21',
    selesai: '17:00',
    nama: 'Sistem Operasi',
    kode: 'INF26042',
    sks: 2,
    kelas: '12D',
    ruang: 'MKRT-301'
  },
  {
    hari: 'Jumat',
    mulai: '14:31',
    selesai: '17:00',
    nama: 'Deep Learning',
    kode: 'INF26056',
    sks: 3,
    kelas: '12D',
    ruang: 'MKRT-301'
  }
];

function checkAuth() {
  if (!localStorage.getItem(AUTH_KEY)) {
    window.location.href = '../index.html';
  }
}

function initDarkMode() {
  const saved = localStorage.getItem(DARK_KEY);
  if (saved === 'true') {
    document.body.classList.add('dark');
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(DARK_KEY, isDark);
}

function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const dateEl = document.getElementById('todayDate');
  const timeEl = document.getElementById('liveClock');

  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('id-ID', options);
  }

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = '../index.html';
}

function getTodayName(date = new Date()) {
  const dayNames = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu'
  ];
  return dayNames[date.getDay()];
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function getNextClass(now = new Date()) {
  const today = getTodayName(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const upcomingToday = jadwalKuliah
    .filter(item => item.hari === today)
    .find(item => toMinutes(item.selesai) > currentMinutes);

  if (upcomingToday) {
    return { ...upcomingToday, dayOffset: 0 };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDate = new Date(now.getTime() + offset * 86400000);
    const nextDay = getTodayName(nextDate);
    const nextClass = jadwalKuliah.find(item => item.hari === nextDay);

    if (nextClass) {
      return { ...nextClass, dayOffset: offset };
    }
  }

  return null;
}

function renderDashboard() {
  const todaySchedule = document.getElementById('todaySchedule');
  const nextClass = document.getElementById('nextClass');

  if (!todaySchedule || !nextClass) {
    return;
  }

  const now = new Date();
  const todayItems = jadwalKuliah.filter(
    item => item.hari === getTodayName(now)
  );

  todaySchedule.innerHTML = todayItems.length
    ? todayItems.map(item => `
      <article class="schedule-row">
        <span class="time">${item.mulai} - ${item.selesai}</span>
        <div>
          <h3>${item.nama}</h3>
          <p>${item.kode} · Ruang ${item.ruang}</p>
        </div>
        <span class="badge">${item.sks} SKS</span>
      </article>
    `).join('')
    : '<p class="no-class">Tidak ada jadwal kuliah hari ini.</p>';

  nextClass.addEventListener('click', event => {
    if (event.target.closest('[data-enable-notifications]')) {
      enableClassNotifications();
    }
  });

  renderNextClass();
  clearInterval(nextClassTimer);
  nextClassTimer = setInterval(renderNextClass, 1000);
}

function getClassTarget(next, now) {
  const target = new Date(now);
  target.setDate(target.getDate() + next.dayOffset);
  const [hours, minutes] = next.mulai.split(':');
  target.setHours(hours, minutes, 0, 0);
  return target;
}

function enableClassNotifications() {
  const button = document.querySelector('[data-enable-notifications]');

  if (!('Notification' in window)) {
    if (button) {
      button.textContent = 'Notifikasi tidak didukung';
      button.disabled = true;
    }
    return;
  }

  Notification.requestPermission().then(permission => {
    if (button) {
      button.textContent = permission === 'granted'
        ? 'Notifikasi aktif'
        : 'Izin notifikasi ditolak';
      button.disabled = permission === 'granted';
    }
  });
}

function renderNextClass() {
  const nextClass = document.getElementById('nextClass');

  if (!nextClass) {
    return;
  }

  const now = new Date();
  const next = getNextClass(now);
  if (!next) {
    nextClass.innerHTML = '<p class="no-class">Belum ada jadwal berikutnya.</p>';
    return;
  }

  const target = getClassTarget(next, now);
  const remaining = Math.max(0, target - now);
  const days = Math.floor(remaining / 86400000);
  const hoursLeft = Math.floor(remaining % 86400000 / 3600000);
  const minutesLeft = Math.floor(remaining % 3600000 / 60000);
  const secondsLeft = Math.floor(remaining % 60000 / 1000);
  const dayLabel = days ? `${days} hari ` : '';
  const countdown = `${dayLabel}${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
  const scheduleKey = `${next.hari}-${next.mulai}-${next.kode}`;

  if (nextClass.dataset.scheduleKey !== scheduleKey) {
    nextClass.dataset.scheduleKey = scheduleKey;
    nextClass.innerHTML = `
      <article class="next-class-item">
        <span class="next-class-status">Jadwal terdekat</span>
        <strong class="name">${next.nama}</strong>
        <span class="meta">${next.hari}, ${next.mulai} - ${next.selesai} · Ruang ${next.ruang}</span>
        <strong class="countdown"></strong>
        <button class="notification-button" type="button" data-enable-notifications>Aktifkan notifikasi</button>
      </article>
    `;
  }

  const countdownElement = nextClass.querySelector('.countdown');
  if (countdownElement) {
    countdownElement.textContent = countdown;
  }

  notifyUpcomingClass(next, target, now);
}

function notifyUpcomingClass(next, target, now) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const minutesUntilClass = (target - now) / 60000;
  const notificationKey = `${target.toISOString()}-${next.kode}`;
  if (minutesUntilClass > 0 && minutesUntilClass <= 30 && localStorage.getItem(NOTIFICATION_KEY) !== notificationKey) {
    new Notification(`Kuliah dimulai dalam ${Math.ceil(minutesUntilClass)} menit`, {
      body: `${next.nama} · ${next.mulai} - ${next.selesai} · Ruang ${next.ruang}`
    });
    localStorage.setItem(NOTIFICATION_KEY, notificationKey);
  }
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!minutes) {
    return `${hours} jam`;
  }

  return `${hours} jam ${minutes} menit`;
}

function renderCourseStatistics() {
  const statistics = document.getElementById('courseStatistics');

  if (!statistics || typeof jadwalKuliah === 'undefined') {
    return;
  }

  const totalSks = jadwalKuliah.reduce((sum, item) => sum + Number(item.sks), 0);
  const totalMinutes = jadwalKuliah.reduce(
    (sum, item) => sum + toMinutes(item.selesai) - toMinutes(item.mulai),
    0
  );
  const durationByDay = jadwalKuliah.reduce((days, item) => {
    const duration = toMinutes(item.selesai) - toMinutes(item.mulai);
    days[item.hari] = (days[item.hari] || 0) + duration;
    return days;
  }, {});
  const busiestDuration = Math.max(...Object.values(durationByDay));
  const busiestDays = Object.entries(durationByDay)
    .filter(([, duration]) => duration === busiestDuration)
    .map(([day]) => day)
    .join(', ');
  const highestSks = Math.max(...jadwalKuliah.map(item => Number(item.sks)));
  const highestSksCourses = jadwalKuliah
    .filter(item => Number(item.sks) === highestSks)
    .map(item => item.nama)
    .join(', ');

  statistics.innerHTML = `
    <article class="course-stat-card">
      <span class="course-stat-label">Total SKS</span>
      <strong>${totalSks} <small>SKS</small></strong>
    </article>
    <article class="course-stat-card">
      <span class="course-stat-label">Total Mata Kuliah</span>
      <strong>${jadwalKuliah.length}</strong>
    </article>
    <article class="course-stat-card">
      <span class="course-stat-label">Total Jam Kuliah per Minggu</span>
      <strong>${formatDuration(totalMinutes)}</strong>
    </article>
    <article class="course-stat-card">
      <span class="course-stat-label">Hari Kuliah Paling Padat</span>
      <strong>${busiestDays}</strong>
      <span class="course-stat-detail">${formatDuration(busiestDuration)} durasi kuliah</span>
    </article>
    <article class="course-stat-card course-stat-card-wide">
      <span class="course-stat-label">Mata Kuliah dengan SKS Terbanyak</span>
      <strong>${highestSks} SKS</strong>
      <span class="course-stat-detail">${highestSksCourses}</span>
    </article>
  `;
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.overlay');

  if (!menuBtn || !sidebar) {
    return;
  }

  menuBtn.setAttribute('aria-controls', sidebar.id || 'sidebar');
  menuBtn.setAttribute('aria-expanded', 'false');
  if (!menuBtn.getAttribute('aria-label')) {
    menuBtn.setAttribute('aria-label', 'Buka menu navigasi');
  }

  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (overlay) {
      overlay.classList.add('active');
    }
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('active');
    });
  }

  document.querySelectorAll('.sidebar .nav-link, .sidebar-footer button').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

function setActiveNav(currentPage) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    }
  });
}

function initPage(page) {
  checkAuth();
  initDarkMode();
  updateDateTime();
  setInterval(updateDateTime, 1000);
  setupMobileMenu();
  setActiveNav(page);

  document.querySelectorAll('[data-logout]').forEach(button => {
    button.addEventListener('click', logout);
  });

  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
    if (darkToggle.tagName !== 'BUTTON') {
      darkToggle.setAttribute('role', 'button');
      darkToggle.setAttribute('tabindex', '0');
    }
    darkToggle.setAttribute('aria-label', 'Aktifkan atau matikan dark mode');
    darkToggle.addEventListener('click', toggleDarkMode);
    darkToggle.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleDarkMode();
      }
    });
  }
}
