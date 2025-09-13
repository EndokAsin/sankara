import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase (Ganti dengan kredensial Anda)
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUBw7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Elemen DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleButton = document.getElementById('toggle-button');
const toggleText = document.getElementById('toggle-text');
const messageEl = document.getElementById('message-el');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');

let isLogin = true;

// Fungsi untuk menampilkan pesan
const showMessage = (message, isError = false) => {
    messageEl.textContent = message;
    messageEl.className = `text-center mb-4 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`;
};

// Fungsi untuk beralih antara login dan registrasi
const toggleForms = () => {
    isLogin = !isLogin;
    messageEl.textContent = ''; // Clear message on toggle
    if (isLogin) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        formTitle.textContent = 'Selamat Datang Kembali';
        formSubtitle.textContent = 'Masuk untuk melanjutkan dan menjadi bagian dari perubahan.';
        toggleText.innerHTML = 'Belum punya akun? <button id="toggle-button" class="font-medium text-sankara-green-dark hover:underline">Daftar sekarang</button>';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        formTitle.textContent = 'Bergabung dengan Sankara';
        formSubtitle.textContent = 'Buat akun baru untuk memulai perjalanan kerelawanan Anda.';
        toggleText.innerHTML = 'Sudah punya akun? <button id="toggle-button" class="font-medium text-sankara-green-dark hover:underline">Masuk di sini</button>';
    }
    // Re-attach event listener to the new button
    document.getElementById('toggle-button').addEventListener('click', toggleForms);
};

// Event listener untuk tombol toggle
toggleButton.addEventListener('click', toggleForms);

// Event listener untuk form login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        showMessage(`Error: ${error.message}`, true);
    } else {
        showMessage('Login berhasil! Anda akan diarahkan...', false);
        setTimeout(() => {
            window.location.href = 'index.html'; // Arahkan ke halaman utama setelah login
        }, 1500);
    }
});

// Event listener untuk form registrasi
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('register-fullname').value;
    const phone = document.getElementById('register-phone').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName,
                phone_number: phone,
            }
        }
    });

    if (error) {
        showMessage(`Error: ${error.message}`, true);
    } else {
        showMessage('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.', false);
        loginForm.reset();
        registerForm.reset();
        // Optionally toggle back to login form after successful registration
        setTimeout(toggleForms, 2000); 
    }
});
