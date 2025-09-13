import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    // Elemen UI
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const notification = document.getElementById('notification');
    const mainFormsContainer = document.getElementById('main-forms');
    const otpSection = document.getElementById('otp-section');
    const otpForm = document.getElementById('otp-form');
    const otpEmailDisplay = document.getElementById('otp-email-display');
    const otpInputsContainer = document.getElementById('otp-inputs');

    let userEmailForVerification = '';

    // Fungsi untuk menampilkan notifikasi
    const showNotification = (message, type = 'success') => {
        notification.textContent = message;
        notification.className = 'p-4 text-sm rounded-lg mb-4'; // Reset classes
        if (type === 'success') {
            notification.classList.add('bg-green-100', 'text-green-700');
        } else {
            notification.classList.add('bg-red-100', 'text-red-700');
        }
    };
    
    // Logika beralih tab
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('tab-active');
        registerTab.classList.remove('tab-active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        notification.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('tab-active');
        loginTab.classList.remove('tab-active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        notification.classList.add('hidden');
    });

    // Handler form login (tetap menggunakan password)
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
            window.location.href = 'index.html';
        } catch (error) {
            showNotification(`Gagal masuk: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Masuk';
        }
    });

    // Handler form registrasi (tahap 1: kirim data & minta token)
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
                    data: { full_name: fullName }
                }
            });

            if (error) throw error;

            // Jika berhasil, tampilkan form OTP
            userEmailForVerification = email;
            otpEmailDisplay.textContent = email;
            mainFormsContainer.classList.add('hidden');
            otpSection.classList.remove('hidden');
            showNotification('Kode verifikasi telah dikirim ke email Anda.');

        } catch (error) {
            showNotification(`Gagal mendaftar: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Daftar & Dapatkan Kode';
        }
    });

    // Handler form verifikasi OTP (tahap 2: verifikasi token)
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = Array.from(otpInputsContainer.children);
        const token = inputs.map(input => input.value).join('');
        const submitButton = otpForm.querySelector('button[type="submit"]');

        if (token.length !== 6) {
            showNotification('Harap masukkan 6 digit kode OTP.', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Memverifikasi...';

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: userEmailForVerification,
                token: token,
                type: 'signup'
            });

            if (error) throw error;

            showNotification('Verifikasi berhasil! Anda akan diarahkan ke halaman utama.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            showNotification(`Verifikasi gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Verifikasi Akun';
        }
    });
    
    // Logika untuk auto-focus input OTP
    otpInputsContainer.addEventListener('input', (e) => {
        const target = e.target;
        const nextInput = target.nextElementSibling;
        if (nextInput && target.value) {
            nextInput.focus();
        }
    });
});
