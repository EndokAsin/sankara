
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    // === Elemen UI ===
    const notification = document.getElementById('notification');
    const mainFormsContainer = document.getElementById('main-forms');
    
    // Form Login & Register
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Form OTP Pendaftaran
    const otpSection = document.getElementById('otp-section');
    const otpForm = document.getElementById('otp-form');
    const otpEmailDisplay = document.getElementById('otp-email-display');
    const otpInputsContainer = document.getElementById('otp-inputs');
    
    // Form Reset Password
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const resetPasswordSection = document.getElementById('reset-password-section');
    const requestResetForm = document.getElementById('request-reset-form');
    const verifyResetOtpForm = document.getElementById('verify-reset-otp-form');
    const resetOtpInputsContainer = document.getElementById('reset-otp-inputs');
    const updatePasswordForm = document.getElementById('update-password-form');
    const backToLoginBtn = document.getElementById('back-to-login-1');

    let userEmailForVerification = ''; // Untuk registrasi & reset password

    // === Fungsi Helper ===
    const showNotification = (message, type = 'success') => {
        notification.textContent = message;
        notification.className = 'p-4 text-sm rounded-lg mb-4'; // Reset kelas
        if (type === 'success') {
            notification.classList.add('bg-green-100');
            notification.classList.add('text-green-700');
        } else {
            notification.classList.add('bg-red-100');
            notification.classList.add('text-red-700');
        }
    };

    const setupOtpInputListeners = (container) => {
        container.addEventListener('input', (e) => {
            const target = e.target;
            const nextInput = target.nextElementSibling;
            if (nextInput && target.value) {
                nextInput.focus();
            }
        });
    };

    // === Logika UI ===
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
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainFormsContainer.classList.add('hidden');
        resetPasswordSection.classList.remove('hidden');
        notification.classList.add('hidden');
    });
    
    backToLoginBtn.addEventListener('click', () => {
        mainFormsContainer.classList.remove('hidden');
        resetPasswordSection.classList.add('hidden');
    });

    // === Handler Form ===
    
    // Handler form login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Memproses...';
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

    // Handler form registrasi
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const fullName = document.getElementById('register-fullname').value;
        if (password.length < 6) {
            showNotification('Password harus memiliki minimal 6 karakter.', 'error');
            return;
        }
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Mendaftar...';
        try {
            const { data, error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: fullName } }
            });
            if (error) throw error;
            if (data.user) {
                userEmailForVerification = email;
                otpEmailDisplay.textContent = email;
                mainFormsContainer.classList.add('hidden');
                otpSection.classList.remove('hidden');
                showNotification('Kode verifikasi telah dikirim ke email Anda.');
            }
        } catch (error) {
            showNotification(`Gagal mendaftar: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Daftar & Dapatkan Kode';
        }
    });

    // Handler form verifikasi OTP pendaftaran
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = Array.from(otpInputsContainer.children).map(input => input.value).join('');
        if (token.length !== 6) {
            showNotification('Harap masukkan 6 digit kode OTP.', 'error');
            return;
        }
        const submitButton = otpForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Memverifikasi...';
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: userEmailForVerification, token, type: 'signup'
            });
            if (error) throw error;
            showNotification('Verifikasi berhasil! Anda akan diarahkan ke halaman utama.');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        } catch (error) {
            showNotification(`Verifikasi gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Verifikasi Akun';
        }
    });

    // Handler form minta reset password
    requestResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        userEmailForVerification = email; // Simpan email untuk tahap selanjutnya
        const submitButton = requestResetForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin, // Diperlukan, meskipun kita pakai OTP
            });
            if (error) throw error;
            showNotification('Kode reset password telah dikirim ke email Anda.');
            requestResetForm.classList.add('hidden');
            verifyResetOtpForm.classList.remove('hidden');
        } catch (error) {
            showNotification(`Gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Kirim Kode';
        }
    });
    
    // Handler form verifikasi OTP reset password
    verifyResetOtpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = Array.from(resetOtpInputsContainer.children).map(input => input.value).join('');
        if (token.length !== 6) {
            showNotification('Harap masukkan 6 digit kode OTP.', 'error');
            return;
        }
        const submitButton = verifyResetOtpForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Memverifikasi...';
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: userEmailForVerification, token, type: 'recovery'
            });
            if (error) throw error;
            showNotification('Verifikasi berhasil! Silakan buat password baru Anda.');
            verifyResetOtpForm.classList.add('hidden');
            updatePasswordForm.classList.remove('hidden');
        } catch (error) {
            showNotification(`Verifikasi gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Verifikasi Kode';
        }
    });
    
    // Handler form update password baru
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        if (newPassword.length < 6) {
            showNotification('Password baru harus minimal 6 karakter.', 'error');
            return;
        }
        const submitButton = updatePasswordForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Menyimpan...';
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            showNotification('Password berhasil diubah! Silakan login dengan password baru Anda.');
            setTimeout(() => {
                resetPasswordSection.classList.add('hidden');
                mainFormsContainer.classList.remove('hidden');
                loginTab.click(); // Pindahkan ke tab login
            }, 2500);
        } catch (error) {
            showNotification(`Gagal memperbarui password: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Simpan Password Baru';
        }
    });
    
    // === Inisialisasi ===
    setupOtpInputListeners(otpInputsContainer);
    setupOtpInputListeners(resetOtpInputsContainer);
});
