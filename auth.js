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
        formSubtitle.textContent = 'Dapatkan link login instan ke email Anda.';
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
        formSubtitle.textContent = 'Daftar dan dapatkan link verifikasi di email Anda.';
        notification.classList.add('hidden');
    });

    // Handler untuk form login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';
        notification.classList.add('hidden');

        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            showNotification('Link login telah dikirim! Silakan periksa email Anda.');
        } catch (error) {
            showNotification(`Gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Kirim Link Login';
        }
    });

    // Handler untuk form registrasi
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const fullName = document.getElementById('register-fullname').value;
        const submitButton = registerForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Mendaftar...';
        notification.classList.add('hidden');
        
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            showNotification('Link verifikasi telah dikirim! Silakan periksa email Anda untuk menyelesaikan pendaftaran.');
        } catch (error) {
            let errorMessage = `Gagal mendaftar: ${error.message}`;
            if (error.message.toLowerCase().includes('signups not allowed')) {
                errorMessage = 'Gagal: Pendaftaran pengguna baru tidak diaktifkan.';
            }
            showNotification(errorMessage, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Daftar & Kirim Link Verifikasi';
        }
    });
    
    // Cek jika pengguna baru saja login dari magic link
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            showNotification('Login berhasil! Anda akan diarahkan...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
});
