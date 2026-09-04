const CORRECT_USER = 'Nikolaus';
// Ini hanya penghalang akses sederhana untuk GitHub Pages, bukan autentikasi server.
const CORRECT_PASS = '051227';

const loginForm = document.querySelector('#loginForm');
const loginMessage = document.querySelector('#loginMessage');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value;

  if (username === CORRECT_USER && password === CORRECT_PASS) {
    localStorage.setItem('nk_auth', 'true');
    window.location.href = 'pages/dashboard.html';
  } else {
    loginMessage.textContent = 'Username atau password salah.';
    loginMessage.style.color = 'var(--coral)';
  }
});
