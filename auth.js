import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    // === Elemen UI ===
    const elements = {
        notification: document.getElementById('notification'),
        mainFormsContainer: document.getElementById('main-forms-container'),
        formTitle: document.getElementById('form-title'),
        formSubtitle: document.getElementById('form-subtitle'),
        loginTab: document.getElementById('login-tab'),
        registerTab: document.getElementById('register-tab'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        otpSection: document.getElementById('otp-section'),
        otpForm: document.getElementById('otp-form'),
        otpEmailDisplay: document.getElementById('otp-email-display'),
        otpInputsContainer: document.getElementById('otp-inputs'),
        forgotPasswordLink: document.getElementById('forgot-password-link'),
        resetPasswordSection: document.getElementById('reset-password-section'),
        requestResetForm: document.getElementById('request-reset-form'),
        verifyResetOtpForm: document.getElementById('verify-reset-otp-form'),
        resetOtpInputsContainer: document.getElementById('reset-otp-inputs'),
        updatePasswordForm: document.getElementById('update-password-form'),
        backToLoginBtn: document.getElementById('back-to-login-1'),
        googleLoginBtn: document.getElementById('google-login-btn')
    };

    let userEmailForVerification = '';

    // === Fungsi Helper ===
    const showNotification = (message, type = 'success') => {
        if (!elements.notification) return;
        elements.notification.textContent = message;
        elements.notification.className = 'p-4 text-sm rounded-lg mb-4';
        elements.notification.classList.add(type === 'success' ? 'bg-green-100' : 'bg-red-100');
        elements.notification.classList.add(type === 'success' ? 'text-green-700' : 'text-red-700');
    };
    
    const setupOtpInputListeners = (container) => {
        if (container) {
            container.addEventListener('input', (e) => {
                const target = e.target;
                const nextInput = target.nextElementSibling;
                if (nextInput && target.value) nextInput.focus();
            });
        }
    };

    // === Logika UI ===
    elements.loginTab?.addEventListener('click', () => {
        elements.loginTab.classList.add('tab-active');
        elements.registerTab.classList.remove('tab-active');
        elements.loginForm.classList.remove('hidden');
        elements.registerForm.classList.add('hidden');
        elements.formTitle.textContent = 'Masuk ke Akun Anda';
        elements.formSubtitle.textContent = 'Selamat datang kembali! Silakan masuk.';
        elements.notification.classList.add('hidden');
    });

    elements.registerTab?.addEventListener('click', () => {
        elements.registerTab.classList.add('tab-active');
        elements.loginTab.classList.remove('tab-active');
        elements.registerForm.classList.remove('hidden');
        elements.loginForm.classList.add('hidden');
        elements.formTitle.textContent = 'Buat Akun Baru';
        elements.formSubtitle.textContent = 'Lengkapi data diri Anda untuk menjadi relawan.';
        elements.notification.classList.add('hidden');
    });

    elements.forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        elements.mainFormsContainer.classList.add('hidden');
        elements.resetPasswordSection.classList.remove('hidden');
        elements.notification.classList.add('hidden');
    });

    elements.backToLoginBtn?.addEventListener('click', () => {
        elements.mainFormsContainer.classList.remove('hidden');
        elements.resetPasswordSection.classList.add('hidden');
        elements.requestResetForm.classList.remove('hidden');
        elements.verifyResetOtpForm.classList.add('hidden');
        elements.updatePasswordForm.classList.add('hidden');
    });

    // === Handler Form ===
    
    // Handler form login
    elements.loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitButton = elements.loginForm.querySelector('button[type="submit"]');
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
    elements.registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const fullName = document.getElementById('register-fullname').value;
        if (password.length < 6) {
            showNotification('Password harus memiliki minimal 6 karakter.', 'error');
            return;
        }
        const submitButton = elements.registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Mendaftar...';
        try {
            const { data, error } = await supabase.auth.signUp({
                email, password, options: { data: { full_name: fullName } }
            });
            if (error) throw error;
            if (data.user) {
                userEmailForVerification = email;
                elements.otpEmailDisplay.textContent = email;
                elements.mainFormsContainer.classList.add('hidden');
                elements.otpSection.classList.remove('hidden');
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
    elements.otpForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = Array.from(elements.otpInputsContainer.children).map(input => input.value).join('');
        if (token.length !== 6) {
            showNotification('Harap masukkan 6 digit kode OTP.', 'error');
            return;
        }
        const submitButton = elements.otpForm.querySelector('button[type="submit"]');
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
    elements.requestResetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        userEmailForVerification = email;
        const submitButton = elements.requestResetForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            showNotification('Kode reset password telah dikirim ke email Anda.');
            elements.requestResetForm.classList.add('hidden');
            elements.verifyResetOtpForm.classList.remove('hidden');
        } catch (error) {
            showNotification(`Gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Kirim Kode';
        }
    });
    
    // Handler form verifikasi OTP reset password
    elements.verifyResetOtpForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = Array.from(elements.resetOtpInputsContainer.children).map(input => input.value).join('');
        if (token.length !== 6) {
            showNotification('Harap masukkan 6 digit kode OTP.', 'error');
            return;
        }
        const submitButton = elements.verifyResetOtpForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Memverifikasi...';
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: userEmailForVerification, token, type: 'recovery'
            });
            if (error) throw error;
            showNotification('Verifikasi berhasil! Silakan buat password baru Anda.');
            elements.verifyResetOtpForm.classList.add('hidden');
            elements.updatePasswordForm.classList.remove('hidden');
        } catch (error) {
            showNotification(`Verifikasi gagal: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Verifikasi Kode';
        }
    });
    
    // Handler form update password baru
    elements.updatePasswordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        if (newPassword.length < 6) {
            showNotification('Password baru harus minimal 6 karakter.', 'error');
            return;
        }
        const submitButton = elements.updatePasswordForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Menyimpan...';
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            showNotification('Password berhasil diubah! Silakan login dengan password baru Anda.');
            setTimeout(() => {
                elements.resetPasswordSection.classList.add('hidden');
                elements.mainFormsContainer.classList.remove('hidden');
                elements.loginTab.click();
            }, 2500);
        } catch (error) {
            showNotification(`Gagal memperbarui password: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Simpan Password Baru';
        }
    });
    
    // Handler Login Pihak Ketiga
    const handleOAuthLogin = async (provider) => {
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) showNotification(`Gagal login dengan ${provider}: ${error.message}`, 'error');
    };

    elements.googleLoginBtn?.addEventListener('click', () => handleOAuthLogin('google'));

    // === Inisialisasi ===
    setupOtpInputListeners(elements.otpInputsContainer);
    setupOtpInputListeners(elements.resetOtpInputsContainer);
});
