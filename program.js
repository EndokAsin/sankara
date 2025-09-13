import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;

// --- UTILITIES ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

// --- AUTHENTICATION ---
const setupAuthUI = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;

    const authButtonsContainer = document.getElementById('auth-buttons');
    const mobileMenuContainer = document.getElementById('mobile-menu');

    if (currentUser) {
        // Desktop Menu
        authButtonsContainer.innerHTML = `
            <span class="text-sm hidden lg:block">Hi, ${session.user.user_metadata.full_name?.split(' ')[0] || currentUser.email.split('@')[0]}</span>
            <button id="logout-button" class="bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition-all duration-300 shadow-md">
                Logout
            </button>
        `;
        document.getElementById('logout-button').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });

        // Mobile Menu
        mobileMenuContainer.innerHTML = `
            <a href="index.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Home</a>
            <a href="tentang.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tentang Sankara</a>
            <a href="tim.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tim Kami</a>
            <a href="program.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Program</a>
            <a href="berita.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Berita</a>
            <a href="mitra.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Mitra</a>
            <a href="kontak.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Kontak</a>
            <button id="mobile-logout-button" class="block w-full text-left py-2 px-4 text-sm bg-red-500 text-white text-center rounded-md m-2">Logout</button>
        `;
        document.getElementById('mobile-logout-button').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.reload();
        });

    } else {
        // Desktop Menu
        authButtonsContainer.innerHTML = `
            <a href="auth.html" class="text-sankara-dark font-medium hover:text-sankara-green-dark transition-colors">Login</a>
            <a href="auth.html" class="bg-sankara-green-dark text-white font-bold py-2 px-6 rounded-full hover:bg-sankara-green-dark/90 transition-all duration-300 shadow-md">
                Jadi Relawan
            </a>
        `;

        // Mobile Menu
        mobileMenuContainer.innerHTML = `
            <a href="index.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Home</a>
            <a href="tentang.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tentang Sankara</a>
            <a href="tim.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tim Kami</a>
            <a href="program.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Program</a>
            <a href="berita.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Berita</a>
            <a href="mitra.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Mitra</a>
            <a href="kontak.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Kontak</a>
            <a href="auth.html" class="block py-2 px-4 text-sm bg-sankara-green-dark text-white text-center rounded-md m-2">Login / Daftar</a>
        `;
    }
};


// --- UI INTERACTIONS (Dropdowns, Mobile Menu) ---
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

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const container = document.getElementById('about-dropdown-container');
        if (container && !container.contains(event.target)) {
            aboutDropdownMenu.classList.add('hidden');
        }
    });
};

// --- PROGRAM LOGIC ---
const eventsLoader = document.getElementById('events-loader');
const upcomingContainer = document.getElementById('content-upcoming');
const closedContainer = document.getElementById('content-closed');
const tabUpcoming = document.getElementById('tab-upcoming');
const tabClosed = document.getElementById('tab-closed');
const detailModal = document.getElementById('detail-modal');
const detailModalContent = document.getElementById('detail-modal-content');
const registerModal = document.getElementById('register-modal');
const registerModalContent = document.getElementById('register-modal-content');

let allPrograms = [];

const renderPrograms = (filter) => {
    const container = filter === 'upcoming' ? upcomingContainer : closedContainer;
    container.innerHTML = '';
    const now = new Date();

    const filteredPrograms = allPrograms.filter(event => {
        const eventDate = new Date(event.start_date);
        return filter === 'upcoming' ? eventDate >= now : eventDate < now;
    });

    if (filteredPrograms.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 col-span-full">Tidak ada program yang tersedia saat ini.</p>`;
        return;
    }

    filteredPrograms.forEach(event => {
        const card = `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <img src="${event.image_url || 'https://placehold.co/600x400/dcfce7/1e293b?text=Sankara'}" alt="${event.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <p class="text-sm text-gray-500 mb-1">${event.category || 'Umum'}</p>
                    <h3 class="text-xl font-bold text-sankara-dark mb-2 line-clamp-2">${event.title}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">${event.description}</p>
                    <div class="flex justify-between items-center">
                         <p class="text-sm font-semibold text-sankara-green-dark">Rp ${new Intl.NumberFormat('id-ID').format(event.fee || 0)}</p>
                        <button data-event-id="${event.id}" class="view-detail-btn bg-sankara-dark text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors">
                            Lihat Detail
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
};

const fetchAndRenderPrograms = async () => {
    if (!eventsLoader) return; // Guard clause
    eventsLoader.style.display = 'block';
    upcomingContainer.innerHTML = '';
    closedContainer.innerHTML = '';

    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: true });

        if (error) throw error;
        
        allPrograms = data;
        renderPrograms('upcoming'); // Initial render
        renderPrograms('closed'); // Pre-render closed tab
        
        // Initially show upcoming tab
        upcomingContainer.classList.remove('hidden');
        closedContainer.classList.add('hidden');
        tabUpcoming.classList.add('tab-active');
        tabClosed.classList.remove('tab-active');


    } catch (error) {
        console.error('Error fetching programs:', error);
        upcomingContainer.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat program. Error: ${error.message}</p>`;
    } finally {
        eventsLoader.style.display = 'none';
    }
};

const openDetailModal = (eventId) => {
    // Pengecekan login dipindahkan ke sini
    if (!currentUser) {
        alert("Anda harus login terlebih dahulu untuk melihat detail program.");
        window.location.href = 'auth.html';
        return; // Hentikan fungsi jika pengguna belum login
    }

    const event = allPrograms.find(e => e.id === eventId);
    if (!event) return;

    detailModalContent.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-sankara-dark">${event.title}</h2>
            <button id="close-detail-modal" class="text-gray-500 text-3xl leading-none hover:text-gray-800">&times;</button>
        </div>
        <div class="space-y-4 text-gray-700">
            <p><strong class="font-semibold text-gray-800">Jenis Kegiatan:</strong> ${event.activity_type || 'N/A'}</p>
            <p><strong class="font-semibold text-gray-800">Dibuat oleh:</strong> ${event.organizer || 'Sankara'}</p>
            <p><strong class="font-semibold text-gray-800">Deskripsi:</strong> ${event.description || 'Tidak ada deskripsi.'}</p>
            <hr class="my-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong class="font-semibold text-gray-800">Kategori:</strong> ${event.category || 'N/A'}</p>
                <p><strong class="font-semibold text-gray-800">Kuota Tersedia:</strong> ${event.quota || 'N/A'} Orang</p>
                <p><strong class="font-semibold text-gray-800">Waktu:</strong> ${formatDate(event.start_date)}</p>
                <p><strong class="font-semibold text-gray-800">Lokasi:</strong> ${event.location || 'N/A'}</p>
            </div>
            <div>
                <strong class="font-semibold text-gray-800 block mb-2">Tugas Relawan:</strong>
                <ul class="list-disc list-inside space-y-1 pl-2">
                    ${(event.tasks || '').split('\n').map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
            <div>
                <strong class="font-semibold text-gray-800 block mb-2">Kriteria Relawan:</strong>
                <ul class="list-disc list-inside space-y-1 pl-2">
                     ${(event.criteria || '').split('\n').map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            <div class="mt-6 flex justify-end">
                <button data-event-id="${event.id}" id="open-register-modal-btn" class="bg-sankara-green-dark text-white font-bold py-3 px-6 rounded-lg hover:bg-sankara-green-dark/90 transition-all">
                    Jadi Volunteer
                </button>
            </div>
        </div>
    `;
    detailModal.classList.remove('hidden');

    document.getElementById('close-detail-modal').addEventListener('click', () => detailModal.classList.add('hidden'));
    document.getElementById('open-register-modal-btn').addEventListener('click', () => openRegisterModal(event.id));
};

const openRegisterModal = (eventId) => {
    // Pengecekan di sini tetap ada sebagai lapisan keamanan kedua
    if (!currentUser) {
        alert("Anda harus login terlebih dahulu untuk mendaftar.");
        window.location.href = 'auth.html';
        return;
    }
    
    const event = allPrograms.find(e => e.id === eventId);
    if (!event) return;

    detailModal.classList.add('hidden'); // Hide detail modal first

    registerModalContent.innerHTML = `
         <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold text-sankara-dark">Pendaftaran Volunteer</h2>
            <button id="close-register-modal" class="text-gray-500 text-3xl leading-none hover:text-gray-800">&times;</button>
        </div>
        <p class="text-gray-600 mb-4">Anda akan mendaftar untuk: <strong class="text-sankara-dark">${event.title}</strong></p>
        
        <form id="registration-form" class="space-y-4">
             <div>
                <label for="phone-number" class="block text-sm font-medium text-gray-700">Nomor Ponsel Aktif *</label>
                <div class="relative mt-1">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">+62</span>
                    </div>
                    <input type="tel" id="phone-number" required class="block w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sankara-green-dark focus:border-sankara-green-dark" placeholder="8123456789">
                </div>
            </div>
            <div class="pt-4 border-t">
                <h3 class="font-semibold text-lg mb-2">Rincian Pembayaran</h3>
                <div class="flex justify-between text-gray-600">
                    <span>Biaya Program</span>
                    <span>Rp ${new Intl.NumberFormat('id-ID').format(event.fee || 0)}</span>
                </div>
                 <div class="flex justify-between text-gray-600">
                    <span>Biaya Admin</span>
                    <span>Rp 0</span>
                </div>
                 <div class="flex justify-between font-bold text-sankara-dark text-lg mt-2">
                    <span>Total Pembayaran</span>
                    <span>Rp ${new Intl.NumberFormat('id-ID').format(event.fee || 0)}</span>
                </div>
            </div>
            <button type="submit" class="w-full bg-sankara-green-dark text-white font-bold py-3 rounded-lg hover:bg-sankara-green-dark/90 transition-all">
                Lanjut ke Pembayaran
            </button>
        </form>
    `;
    registerModal.classList.remove('hidden');

    document.getElementById('close-register-modal').addEventListener('click', () => registerModal.classList.add('hidden'));
    document.getElementById('registration-form').addEventListener('submit', (e) => handleRegistrationSubmit(e, event.id));
};

const handleRegistrationSubmit = async (e, eventId) => {
    e.preventDefault();
    if (!currentUser) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        return;
    }
    const registerButton = e.target.querySelector('button[type="submit"]');
    registerButton.disabled = true;
    registerButton.textContent = 'Memproses...';


    const { data, error } = await supabase
        .from('event_registrations')
        .insert([
            { user_id: currentUser.id, event_id: eventId }
        ]);

    if (error) {
        console.error("Error saving registration:", error);
        alert(`Gagal mendaftar: ${error.message}. Mungkin Anda sudah terdaftar di program ini.`);
        registerButton.disabled = false;
        registerButton.textContent = 'Lanjut ke Pembayaran';
    } else {
        alert("Pendaftaran berhasil! Terima kasih telah bergabung. Detail selanjutnya akan diinformasikan oleh panitia.");
        registerModal.classList.add('hidden');
    }
};

// --- EVENT LISTENERS ---
const setupTabListeners = () => {
    if (tabUpcoming) {
        tabUpcoming.addEventListener('click', () => {
            upcomingContainer.classList.remove('hidden');
            closedContainer.classList.add('hidden');
            tabUpcoming.classList.add('tab-active');
            tabClosed.classList.remove('tab-active');
        });
    }

    if (tabClosed) {
        tabClosed.addEventListener('click', () => {
            upcomingContainer.classList.add('hidden');
            closedContainer.classList.remove('hidden');
            tabUpcoming.classList.remove('tab-active');
            tabClosed.classList.add('tab-active');
        });
    }
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('view-detail-btn')) {
        const eventId = e.target.dataset.eventId;
        openDetailModal(eventId);
    }
    // Close modal if clicking on backdrop
    if (e.target === detailModal || e.target === registerModal) {
        detailModal.classList.add('hidden');
        registerModal.classList.add('hidden');
    }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI();
    setupUIInteractions();
    fetchAndRenderPrograms();
    setupTabListeners();
});

