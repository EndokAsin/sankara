import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    // Elemen UI
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const notification = document.getElementById('notification');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');

    // Fungsi untuk menampilkan notifikasi
    const showNotification = (message, type = 'success') => {
        notification.textContent = message;
        notification.className = 'p-4 text-sm rounded-lg'; // Reset classes
        if (type === 'success') {
            notification.classList.add('bg-green-100', 'text-green-700');
        } else {
            notification.classList.add('bg-red-100', 'text-red-700');
        }
    };

    // Logika untuk beralih tab
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('tab-active');
        loginTab.classList.remove('text-gray-500');
        registerTab.classList.remove('tab-active');
        registerTab.classList.add('text-gray-500');
        
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        
        formTitle.textContent = 'Masuk ke Akun Anda';
        formSubtitle.textContent = 'Selamat datang kembali! Silakan masuk.';
        notification.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('tab-active');
        registerTab.classList.remove('text-gray-500');
        loginTab.classList.remove('tab-active');
        loginTab.classList.add('text-gray-500');

        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');

        formTitle.textContent = 'Buat Akun Baru';
        formSubtitle.textContent = 'Lengkapi data diri Anda untuk menjadi relawan.';
        notification.classList.add('hidden');
    });

    // Handler untuk form login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Memproses...';
        notification.classList.add('hidden');

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            // Jika berhasil, Supabase akan set session dan kita bisa redirect
            window.location.href = 'index.html';

        } catch (error) {
            showNotification(`Gagal masuk: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Masuk';
        }
    });

    // Handler untuk form registrasi
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const fullName = document.getElementById('register-fullname').value;
        const submitButton = registerForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Mendaftar...';
        notification.classList.add('hidden');
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) throw error;

            // Jika pendaftaran berhasil tapi butuh verifikasi email
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 showNotification('Gagal: Pengguna sudah terdaftar tetapi belum terverifikasi. Silakan cek email Anda atau coba login.', 'error');
            } else {
                 showNotification('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi akun.');
            }
           
        } catch (error) {
            showNotification(`Gagal mendaftar: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Daftar Akun Baru';
        }
    });
});
