import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const authForm = document.getElementById('auth-form');
const notification = document.getElementById('notification');

// Cek apakah pengguna baru saja login dari magic link
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // Jika berhasil login, arahkan ke halaman utama setelah beberapa detik
        notification.classList.remove('hidden', 'bg-red-100', 'text-red-700');
        notification.classList.add('bg-green-100', 'text-green-700');
        notification.textContent = 'Login berhasil! Anda akan diarahkan ke halaman utama.';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});


authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-address').value;
    const submitButton = authForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Mengirim...';
    notification.classList.add('hidden');

    try {
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                // Halaman tujuan setelah user klik link di email
                emailRedirectTo: window.location.origin, 
            },
        });

        if (error) throw error;

        // Tampilkan pesan sukses
        notification.classList.remove('hidden', 'bg-red-100', 'text-red-700');
        notification.classList.add('bg-green-100', 'text-green-700');
        notification.textContent = 'Link login telah dikirim! Silakan periksa email Anda.';

    } catch (error) {
        console.error('Error sending magic link:', error);
        // Tampilkan pesan error
        notification.classList.remove('hidden', 'bg-green-100', 'text-green-700');
        notification.classList.add('bg-red-100', 'text-red-700');
        notification.textContent = `Gagal mengirim link: ${error.message}`;

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Kirim Link Login';
    }
});
