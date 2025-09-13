import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;

// --- Fungsi Notifikasi ---
const notification = document.getElementById('notification');
const showNotification = (message, type = 'success') => {
    if (!notification) return;
    notification.textContent = message;
    notification.className = 'p-4 mb-6 text-sm rounded-lg';
    notification.classList.add(type === 'success' ? 'bg-green-100' : 'bg-red-100');
    notification.classList.add(type === 'success' ? 'text-green-700' : 'text-red-700');
};

// --- AUTHENTICATION & UI HEADER ---
const setupAuthUI = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;

    if (!currentUser) {
        // Jika tidak ada user, paksa kembali ke halaman login
        window.location.href = 'auth.html';
        return; // Hentikan eksekusi skrip lebih lanjut
    }

    const authButtonsContainer = document.getElementById('auth-buttons');
    const mobileMenuContainer = document.getElementById('mobile-menu');
    
    // Tampilan jika SUDAH LOGIN
    authButtonsContainer.innerHTML = `
        <a href="profile.html" title="Profil Saya" class="p-2 rounded-full bg-sankara-green-light transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-sankara-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        </a>
        <button id="logout-button" class="bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-red-600 transition-colors">
            Logout
        </button>
    `;
    document.getElementById('logout-button').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    mobileMenuContainer.innerHTML = `
        <a href="index.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Home</a>
        <a href="tentang.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tentang Sankara</a>
        <a href="tim.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tim Kami</a>
        <a href="program.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Program</a>
        <a href="berita.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Berita</a>
        <a href="mitra.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Mitra</a>
        <a href="kontak.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Kontak</a>
        <a href="profile.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</a>
        <button id="mobile-logout-button" class="block w-full text-left py-2 px-4 text-sm bg-red-500 text-white text-center rounded-md m-2">Logout</button>
    `;
    document.getElementById('mobile-logout-button').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });
};

const setupUIInteractions = () => {
    const aboutDropdownButton = document.getElementById('about-dropdown-button');
    const aboutDropdownMenu = document.getElementById('about-dropdown-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (aboutDropdownButton) {
        aboutDropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            aboutDropdownMenu.classList.toggle('hidden');
        });
    }
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    document.addEventListener('click', (event) => {
        const container = document.getElementById('about-dropdown-container');
        if (aboutDropdownMenu && container && !container.contains(event.target)) {
            aboutDropdownMenu.classList.add('hidden');
        }
    });
};

// --- LOGIKA PROFIL ---
const loadProfileData = async () => {
    if (!currentUser) return;

    // Tampilkan email dari sesi
    document.getElementById('profile-email').textContent = currentUser.email;

    // Ambil data dari tabel profiles
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', currentUser.id)
            .single(); // Ambil satu baris data

        if (error) throw error;

        if (data) {
            document.getElementById('profile-fullname').textContent = data.full_name || 'Belum diatur';
            document.getElementById('update-fullname').value = data.full_name || '';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        document.getElementById('profile-fullname').textContent = 'Gagal memuat nama';
    }
};

const loadRegisteredPrograms = async () => {
    if (!currentUser) return;
    
    const container = document.getElementById('registered-programs-container');
    const loader = document.getElementById('programs-loader');

    try {
        // 1. Ambil ID program yang diikuti user
        const { data: registrations, error: regError } = await supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', currentUser.id);
        
        if (regError) throw regError;

        if (registrations.length === 0) {
            loader.textContent = 'Anda belum terdaftar di program manapun.';
            return;
        }

        const eventIds = registrations.map(reg => reg.event_id);

        // 2. Ambil detail program berdasarkan ID yang didapat
        const { data: events, error: eventError } = await supabase
            .from('events')
            .select('title, start_date')
            .in('id', eventIds);

        if (eventError) throw eventError;

        loader.style.display = 'none';
        container.innerHTML = ''; // Kosongkan container

        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center';
            eventElement.innerHTML = `
                <div>
                    <p class="font-bold text-sankara-dark">${event.title}</p>
                    <p class="text-sm text-gray-500">Tanggal: ${new Date(event.start_date).toLocaleDateString('id-ID')}</p>
                </div>
                <span class="text-sm font-semibold text-green-600">Terdaftar</span>
            `;
            container.appendChild(eventElement);
        });

    } catch (error) {
        console.error('Error fetching registered programs:', error);
        loader.textContent = 'Gagal memuat program yang diikuti.';
    }
};

// --- HANDLER FORM ---
document.getElementById('update-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newFullName = document.getElementById('update-fullname').value;
    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Menyimpan...';

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: newFullName })
            .eq('id', currentUser.id);

        if (error) throw error;

        showNotification('Nama berhasil diperbarui!', 'success');
        document.getElementById('profile-fullname').textContent = newFullName; // Perbarui tampilan langsung

    } catch (error) {
        showNotification(`Gagal memperbarui nama: ${error.message}`, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Simpan Perubahan';
    }
});

document.getElementById('update-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Menyimpan...';

    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        
        showNotification('Password berhasil diubah!', 'success');
        e.target.reset(); // Kosongkan form

    } catch (error) {
        showNotification(`Gagal mengubah password: ${error.message}`, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Ubah Password';
    }
});


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await setupAuthUI(); // Tunggu setup auth selesai
    setupUIInteractions();
    if (currentUser) { // Hanya jalankan jika user sudah login
        loadProfileData();
        loadRegisteredPrograms();
    }
});

