import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;
let userRegisteredEvents = []; // Menyimpan ID event yang sudah diikuti user

// --- UTILITIES ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

const calculateDaysRemaining = (dateString) => {
    if (!dateString) return 'Tanggal belum ditentukan';
    const now = new Date();
    const eventDate = new Date(dateString);
    now.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `Tersisa ${diffDays} hari`;
    if (diffDays === 0) return 'Berlangsung hari ini';
    return 'Acara telah selesai';
};

// --- FUNGSI BARU UNTUK MENGAMBIL EVENT YANG DIIKUTI USER ---
const fetchUserRegistrations = async () => {
    if (!currentUser) return;
    try {
        const { data, error } = await supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', currentUser.id);
        if (error) throw error;
        userRegisteredEvents = data.map(reg => reg.event_id);
    } catch (error) {
        console.error("Error fetching user registrations:", error);
    }
};

// --- AUTHENTICATION & UI HEADER ---
const setupAuthUI = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;

    const authButtonsContainer = document.getElementById('auth-buttons');
    const mobileMenuContainer = document.getElementById('mobile-menu');
    
    if (!authButtonsContainer || !mobileMenuContainer) return;

    mobileMenuContainer.innerHTML = `
        <a href="index.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Home</a>
        <a href="tentang.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tentang Sankara</a>
        <a href="tim.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tim Kami</a>
        <a href="program.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Program</a>
        <a href="berita.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Berita</a>
        <a href="mitra.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Mitra</a>
        <a href="kontak.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Kontak</a>
    `;

    if (currentUser) {
        await fetchUserRegistrations(); // Ambil data pendaftaran setelah user login
        authButtonsContainer.innerHTML = `
            <a href="profile.html" title="Profil Saya" class="p-2 rounded-full hover:bg-gray-200/50 transition-colors">
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
            window.location.reload();
        });

        mobileMenuContainer.innerHTML += `
            <a href="profile.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</a>
            <button id="mobile-logout-button" class="block w-full text-left py-2 px-4 text-sm bg-red-500 text-white text-center rounded-md m-2">Logout</button>
        `;
        document.getElementById('mobile-logout-button').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        });

    } else {
        authButtonsContainer.innerHTML = `
            <a href="auth.html" class="bg-sankara-green-dark text-white font-bold py-2 px-6 rounded-full hover:bg-sankara-green-dark/90 transition-all duration-300 shadow-md">
                Jadi Relawan
            </a>
        `;

        mobileMenuContainer.innerHTML += `
            <a href="auth.html" class="block py-2 px-4 text-sm bg-sankara-green-dark text-white text-center rounded-md m-2">Jadi Relawan</a>
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

    document.addEventListener('click', (event) => {
        const container = document.getElementById('about-dropdown-container');
        if (aboutDropdownMenu && container && !container.contains(event.target)) {
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
        const daysRemainingText = calculateDaysRemaining(event.start_date);
        
        const registrationCount = event.event_registrations[0]?.count || 0;
        const totalQuota = event.quota;
        const remainingQuota = totalQuota ? totalQuota - registrationCount : null;

        let quotaText;
        let detailButtonHTML;

        if (totalQuota) {
            if (remainingQuota > 0) {
                quotaText = `Sisa Kuota: ${remainingQuota}`;
                detailButtonHTML = `<button data-event-id="${event.id}" class="view-detail-btn bg-sankara-dark text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors">Lihat Detail</button>`;
            } else {
                quotaText = 'Kuota Penuh';
                detailButtonHTML = `<button disabled class="bg-gray-400 text-white text-sm font-bold py-2 px-4 rounded-lg cursor-not-allowed">Penuh</button>`;
            }
        } else {
            quotaText = 'Kuota Terbatas';
            detailButtonHTML = `<button data-event-id="${event.id}" class="view-detail-btn bg-sankara-dark text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors">Lihat Detail</button>`;
        }

        const card = `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <img src="${event.image_url || 'https://placehold.co/600x400/dcfce7/1e293b?text=Sankara'}" alt="${event.title}" class="w-full h-48 object-cover">
                <div class="p-6 flex flex-col flex-grow">
                    <p class="text-sm text-gray-500 mb-1">${event.category || 'Umum'}</p>
                    <h3 class="text-xl font-bold text-sankara-dark mb-2 line-clamp-2">${event.title}</h3>
                    
                    ${filter === 'upcoming' ? `
                    <div class="flex items-center text-sm text-yellow-600 font-semibold mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>${daysRemainingText}</span>
                    </div>` : ''}
                    <div class="flex items-center text-sm text-gray-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>${event.location || 'Online'}</span>
                    </div>

                    <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">${event.description}</p>
                    
                    <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                         <div class="flex items-center text-sm ${remainingQuota !== null && remainingQuota <= 0 ? 'text-red-500' : 'text-gray-600'} font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span>${quotaText}</span>
                         </div>
                        ${detailButtonHTML}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
};

const fetchAndRenderPrograms = async () => {
    if (!eventsLoader) return;
    eventsLoader.style.display = 'block';
    upcomingContainer.innerHTML = '';
    closedContainer.innerHTML = '';

    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, event_registrations(count)')
            .order('start_date', { ascending: true });

        if (error) throw error;
        
        allPrograms = data;
        renderPrograms('upcoming');
        renderPrograms('closed');
        
        upcomingContainer.classList.remove('hidden');
        closedContainer.classList.add('hidden');
        tabUpcoming.classList.add('tab-active');
        tabClosed.classList.remove('tab-active');

    } catch (error) {
        console.error('Error fetching programs:', error);
        if (upcomingContainer) {
            upcomingContainer.innerHTML = `<p class="text-center text-red-500 col-span-full">Gagal memuat program. Error: ${error.message}</p>`;
        }
    } finally {
        if(eventsLoader) eventsLoader.style.display = 'none';
    }
};

const openDetailModal = async (eventId) => { // Dibuat async
    if (!currentUser) {
        alert("Anda harus login terlebih dahulu untuk melihat detail program.");
        window.location.href = 'auth.html';
        return;
    }

    // --- PERBAIKAN: Selalu ambil status pendaftaran terbaru ---
    await fetchUserRegistrations();

    const event = allPrograms.find(e => e.id === eventId);
    if (!event) return;
    
    const registrationCount = event.event_registrations[0]?.count || 0;
    const totalQuota = event.quota;
    const remainingQuota = totalQuota ? totalQuota - registrationCount : null;

    let registerButtonHTML;
    const isAlreadyRegistered = userRegisteredEvents.includes(event.id);

    if (isAlreadyRegistered) {
        registerButtonHTML = `<button disabled class="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed">Sudah Terdaftar</button>`;
    } else if (totalQuota && remainingQuota <= 0) {
        registerButtonHTML = `<button disabled class="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg cursor-not-allowed">Kuota Penuh</button>`;
    } else {
        registerButtonHTML = `<button data-event-id="${event.id}" id="open-register-modal-btn" class="bg-sankara-green-dark text-white font-bold py-3 px-6 rounded-lg hover:bg-sankara-green-dark/90 transition-all">Jadi Volunteer</button>`;
    }

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
                <p><strong class="font-semibold text-gray-800">Kuota Tersedia:</strong> ${remainingQuota !== null ? `${remainingQuota} Orang` : 'Terbatas'}</p>
                <p><strong class="font-semibold text-gray-800">Waktu:</strong> ${formatDate(event.start_date)}</p>
                <p><strong class="font-semibold text-gray-800">Lokasi:</strong> ${event.location || 'N/A'}</p>
            </div>
            <div>
                <strong class="font-semibold text-gray-800 block mb-2">Tugas Relawan:</strong>
                <ul class="list-disc list-inside space-y-1 pl-2">
                    ${(event.tasks || '').split('\n').filter(t => t).map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
            <div>
                <strong class="font-semibold text-gray-800 block mb-2">Kriteria Relawan:</strong>
                <ul class="list-disc list-inside space-y-1 pl-2">
                     ${(event.criteria || '').split('\n').filter(c => c).map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            <div class="mt-6 flex justify-end">
                ${registerButtonHTML}
            </div>
        </div>
    `;
    detailModal.classList.remove('hidden');

    document.getElementById('close-detail-modal').addEventListener('click', () => detailModal.classList.add('hidden'));
    
    const registerBtn = document.getElementById('open-register-modal-btn');
    if(registerBtn) {
        registerBtn.addEventListener('click', () => openRegisterModal(event.id));
    }
};

const openRegisterModal = (eventId) => {
    if (!currentUser) {
        alert("Anda harus login terlebih dahulu untuk mendaftar.");
        window.location.href = 'auth.html';
        return;
    }
    
    const event = allPrograms.find(e => e.id === eventId);
    if (!event) return;

    detailModal.classList.add('hidden');

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
                    <input type="tel" id="phone-number" required class="block w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" placeholder="8123456789">
                </div>
            </div>
             <div>
                <label for="payment-proof" class="block text-sm font-medium text-gray-700">Unggah Bukti Pembayaran *</label>
                <input type="file" id="payment-proof" required accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100">
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
                Daftar & Bayar
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
    const paymentProofFile = document.getElementById('payment-proof').files[0];
    const phoneNumber = document.getElementById('phone-number').value;

    if (!paymentProofFile) {
        alert("Harap unggah bukti pembayaran Anda.");
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = 'Mengunggah bukti...';

    try {
        // 1. Unggah bukti pembayaran
        const fileExt = paymentProofFile.name.split('.').pop();
        const fileName = `${currentUser.id}-${eventId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('registration-proofs')
            .upload(filePath, paymentProofFile);

        if (uploadError) throw uploadError;

        // 2. Dapatkan URL publik dari file yang diunggah
        const { data: urlData } = supabase.storage
            .from('registration-proofs')
            .getPublicUrl(filePath);

        const paymentProofUrl = urlData.publicUrl;

        registerButton.textContent = 'Menyimpan pendaftaran...';

        // 3. Simpan pendaftaran ke database
        const { error: insertError } = await supabase
            .from('event_registrations')
            .insert([
                { user_id: currentUser.id, event_id: eventId, payment_proof_url: paymentProofUrl, phone_number: phoneNumber }
            ]);

        if (insertError) throw insertError;

        alert("Pendaftaran berhasil! Terima kasih telah bergabung. Status pendaftaran Anda akan diverifikasi oleh admin.");
        registerModal.classList.add('hidden');
        await fetchUserRegistrations(); // Perbarui daftar event yang diikuti
        fetchAndRenderPrograms(); // Muat ulang data untuk update kuota

    } catch (error) {
        console.error("Error during registration process:", error);
        alert(`Gagal mendaftar: ${error.message}.`);
        registerButton.disabled = false;
        registerButton.textContent = 'Daftar & Bayar';
    }
};


// --- EVENT LISTENERS ---
const setupTabListeners = () => {
    if (tabUpcoming && tabClosed) {
        tabUpcoming.addEventListener('click', () => {
            upcomingContainer.classList.remove('hidden');
            closedContainer.classList.add('hidden');
            tabUpcoming.classList.add('tab-active');
            tabClosed.classList.remove('tab-active');
        });

        tabClosed.addEventListener('click', () => {
            upcomingContainer.classList.add('hidden');
            closedContainer.classList.remove('hidden');
            tabUpcoming.classList.remove('tab-active');
            tabClosed.classList.add('tab-active');
        });
    }
}

document.addEventListener('click', async (e) => { // Dibuat async
    if (e.target && e.target.classList.contains('view-detail-btn')) {
        const eventId = e.target.dataset.eventId;
        await openDetailModal(eventId); // Await pemanggilan fungsi
    }
    if (e.target === detailModal || e.target === registerModal) {
        detailModal.classList.add('hidden');
        registerModal.classList.add('hidden');
    }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await setupAuthUI();
    setupUIInteractions();
    await fetchAndRenderPrograms();
    setupTabListeners();
});

