import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const notification = document.getElementById('notification');
  const toggleToRegister = document.getElementById('toggleToRegister');
  const toggleToLogin = document.getElementById('toggleToLogin');

  // 🔔 Fungsi notifikasi
  const showNotification = (message, type = 'success') => {
    notification.textContent = message;

    if (type === 'success') {
      notification.setAttribute(
        'class',
        'p-4 text-sm rounded-lg mb-4 bg-green-100 text-green-700'
      );
    } else {
      notification.setAttribute(
        'class',
        'p-4 text-sm rounded-lg mb-4 bg-red-100 text-red-700'
      );
    }
  };

  // 🔄 Toggle ke form Register
  toggleToRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  });

  // 🔄 Toggle ke form Login
  toggleToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // 🔐 Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
      showNotification('Email dan password wajib diisi.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification('Login berhasil!', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        showNotification(data.message || 'Login gagal.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Terjadi kesalahan pada server.', 'error');
    }
  });

  // 📝 Register
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!name || !email || !password) {
      showNotification('Semua field wajib diisi.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification('Registrasi berhasil! Silakan login.', 'success');
        setTimeout(() => {
          registerForm.classList.add('hidden');
          loginForm.classList.remove('hidden');
        }, 1500);
      } else {
        showNotification(data.message || 'Registrasi gagal.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Terjadi kesalahan pada server.', 'error');
    }
  });
});
