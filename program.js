// --- Koneksi ke Supabase ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- State Management ---
let allPrograms = [];

// --- Elemen DOM ---
const loader = document.getElementById('events-loader');
const upcomingContent = document.getElementById('content-upcoming');
const closedContent = document.getElementById('content-closed');
const tabUpcoming = document.getElementById('tab-upcoming');
const tabClosed = document.getElementById('tab-closed');
const detailModal = document.getElementById('detail-modal');
const detailModalContent = document.getElementById('detail-modal-content');
const registerModal = document.getElementById('register-modal');
const registerModalContent = document.getElementById('register-modal-content');

// --- Fungsi Helper ---
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
const formatDate = (dateString, timeString) => {
    if (!dateString || !timeString) return 'Waktu belum ditentukan';
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ` Pukul ${timeString.substring(0, 5)}`;
};

// --- Fungsi Render ---
function renderPrograms(programs, container) {
    if (programs.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Tidak ada program di kategori ini.</p>';
        return;
    }
    container.innerHTML = programs.map(program => `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <img src="${program.poster_url}" alt="${program.title}" class="w-full h-48 object-cover" onerror="this.src='https://placehold.co/600x400/e2e8f0/475569?text=Gambar'"/>
            <div class="p-6">
                <span class="text-sm text-sankara-green-dark font-semibold">${program.category || 'Umum'}</span>
                <h3 class="text-xl font-bold mt-2 text-sankara-dark">${program.title}</h3>
                <p class="text-gray-600 mt-2 text-sm">${program.location}</p>
                <div class="mt-4 border-t pt-4">
                     <button class="detail-button w-full bg-sankara-dark text-white font-bold py-2 px-4 rounded-lg hover:bg-black transition-colors" data-id="${program.id}">
                        Lihat Detail
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProgramDetails(program) {
    detailModalContent.innerHTML = `
        <div class="p-6 md:p-8 relative">
             <button id="close-detail-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl">&times;</button>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Left Column (Image & Main Info) -->
                <div class="md:col-span-1">
                    <img src="${program.poster_url}" alt="${program.title}" class="rounded-lg shadow-md w-full mb-6">
                    <span class="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">${program.activity_type}</span>
                    <h1 class="text-2xl font-bold text-sankara-dark">${program.title}</h1>
                    <p class="text-sm text-gray-500 mt-1">Dibuat oleh: <span class="font-semibold">${program.created_by}</span></p>
                </div>

                <!-- Right Column (Details) -->
                <div class="md:col-span-2">
                    <h2 class="text-lg font-semibold border-b pb-2 mb-4">Detail</h2>
                    <p class="text-gray-700 mb-6">${program.description}</p>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div><strong class="block text-gray-500">Kategori</strong> ${program.category}</div>
                        <div><strong class="block text-gray-500">Kuota</strong> ${program.quota} Orang</div>
                        <div><strong class="block text-gray-500">Waktu</strong> ${formatDate(program.start_date, program.start_time)}</div>
                        <div><strong class="block text-gray-500">Lokasi</strong> ${program.location}</div>
                    </div>

                    <h3 class="text-md font-semibold mb-2">Tugas Volunteer</h3>
                    <ul class="list-disc list-inside text-gray-700 text-sm mb-4 space-y-1">${(program.tasks || '').split('\n').map(t => `<li>${t}</li>`).join('')}</ul>

                    <h3 class="text-md font-semibold mb-2">Kriteria</h3>
                    <ul class="list-disc list-inside text-gray-700 text-sm mb-6 space-y-1">${(program.criteria || '').split('\n').map(c => `<li>${c}</li>`).join('')}</ul>
                    
                    ${program.doc_url ? `<a href="${program.doc_url}" target="_blank" class="text-green-600 hover:underline text-sm">Lihat Dokumen Tambahan</a>` : ''}
                </div>
             </div>
             <div class="border-t mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
                <div class="text-2xl font-bold text-sankara-dark mb-4 md:mb-0">${formatCurrency(program.fee)}</div>
                <button id="show-register-modal-button" class="w-full md:w-auto bg-sankara-green-dark text-white font-bold py-3 px-8 rounded-lg hover:bg-sankara-green-dark/90 transition-all">Jadi Volunteer</button>
             </div>
        </div>
    `;
    showModal(detailModal);

    document.getElementById('close-detail-modal').addEventListener('click', () => hideModal(detailModal));
    document.getElementById('show-register-modal-button').addEventListener('click', () => renderRegistrationForm(program));
}

function renderRegistrationForm(program) {
    hideModal(detailModal);
    registerModalContent.innerHTML = `
         <div class="p-8 relative">
            <button id="close-register-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-3xl">&times;</button>
            <h2 class="text-xl font-bold text-center mb-2">Jadi Volunteer</h2>
            <p class="text-center text-sm text-gray-600 mb-6">${program.title}</p>
            
            <div class="space-y-4">
                <div>
                    <label class="text-sm font-medium">Nomor Ponsel *</label>
                    <div class="flex items-center mt-1">
                        <span class="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">+62</span>
                        <input type="tel" placeholder="8123456789" class="w-full px-4 py-2 border rounded-r-lg">
                    </div>
                </div>
                <div>
                    <label class="text-sm font-medium">Metode Pembayaran</label>
                    <select class="mt-1 w-full px-4 py-2 border rounded-lg bg-white">
                        <option>Pilih metode pembayaran</option>
                        <option>Transfer Bank</option>
                        <option>E-Wallet</option>
                    </select>
                </div>
            </div>

            <div class="mt-6 border-t pt-4 space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-600">Biaya</span> <strong>${formatCurrency(program.fee)}</strong></div>
                <div class="flex justify-between"><span class="text-gray-600">Biaya Admin</span> <strong>${formatCurrency(0)}</strong></div>
                <div class="flex justify-between font-bold text-base"><span class="text-sankara-dark">Total</span> <span>${formatCurrency(program.fee)}</span></div>
            </div>

            <div class="mt-6">
                <button class="w-full bg-sankara-green-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-sankara-green-dark/90">Lanjut</button>
            </div>
         </div>
    `;
    showModal(registerModal);
    document.getElementById('close-register-modal').addEventListener('click', () => hideModal(registerModal));
}

// --- Fungsi Logika ---
async function fetchAndRenderPrograms() {
    try {
        const { data, error } = await db.from('events').select('*').order('start_date', { ascending: true });
        if (error) throw error;
        allPrograms = data;

        const today = new Date().toISOString().split('T')[0];
        const upcoming = allPrograms.filter(p => p.start_date >= today);
        const closed = allPrograms.filter(p => p.start_date < today).reverse();

        renderPrograms(upcoming, upcomingContent);
        renderPrograms(closed, closedContent);

    } catch (error) {
        console.error("Error fetching programs:", error);
        upcomingContent.innerHTML = `<p class="text-red-500 col-span-full text-center">Gagal memuat data program. Error: ${error.message}</p>`;
    } finally {
        loader.style.display = 'none';
    }
}

function switchTab(activeTab) {
    if (activeTab === 'upcoming') {
        tabUpcoming.classList.add('tab-active', 'border-sankara-green-dark', 'text-sankara-green-dark', 'font-semibold');
        tabUpcoming.classList.remove('border-transparent', 'text-gray-500');
        tabClosed.classList.remove('tab-active', 'border-sankara-green-dark', 'text-sankara-green-dark', 'font-semibold');
        tabClosed.classList.add('border-transparent', 'text-gray-500');

        upcomingContent.classList.remove('hidden');
        upcomingContent.classList.add('grid');
        closedContent.classList.add('hidden');
        closedContent.classList.remove('grid');
    } else {
        tabClosed.classList.add('tab-active', 'border-sankara-green-dark', 'text-sankara-green-dark', 'font-semibold');
        tabClosed.classList.remove('border-transparent', 'text-gray-500');
        tabUpcoming.classList.remove('tab-active', 'border-sankara-green-dark', 'text-sankara-green-dark', 'font-semibold');
        tabUpcoming.classList.add('border-transparent', 'text-gray-500');
        
        upcomingContent.classList.add('hidden');
        upcomingContent.classList.remove('grid');
        closedContent.classList.remove('hidden');
        closedContent.classList.add('grid');
    }
}

function showModal(modalElement) {
    modalElement.classList.remove('hidden');
    setTimeout(() => {
        modalElement.classList.remove('opacity-0');
        modalElement.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function hideModal(modalElement) {
    modalElement.classList.add('opacity-0');
    modalElement.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => modalElement.classList.add('hidden'), 300);
}

function handleDetailClick(e) {
    const detailButton = e.target.closest('.detail-button');
    if (detailButton) {
        const programId = detailButton.dataset.id;
        const program = allPrograms.find(p => p.id == programId);
        if (program) {
            renderProgramDetails(program);
        }
    }
}

// --- Menu Mobile & Dropdown ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const aboutDropdownButton = document.getElementById('about-dropdown-button');
    const aboutDropdownMenu = document.getElementById('about-dropdown-menu');
    const aboutDropdownContainer = document.getElementById('about-dropdown-container');

    if (mobileMenu) {
        mobileMenu.innerHTML = `
            <a href="index.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Home</a>
            <a href="tentang.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tentang Sankara</a>
            <a href="tim.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Tim Kami</a>
            <a href="program.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Program</a>
            <a href="berita.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Berita</a>
            <a href="mitra.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Mitra</a>
            <a href="kontak.html" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">Kontak</a>
            <a href="index.html#donate" class="block py-2 px-4 text-sm bg-sankara-green-dark text-white text-center rounded-md m-2">Donasi Sekarang</a>
        `;
    }

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }
    
    if (aboutDropdownButton) {
        aboutDropdownButton.addEventListener('click', () => aboutDropdownMenu.classList.toggle('hidden'));
    }

    document.addEventListener('click', (event) => {
        if (aboutDropdownContainer && !aboutDropdownContainer.contains(event.target)) {
            aboutDropdownMenu.classList.add('hidden');
        }
    });

    // --- Event Listeners ---
    tabUpcoming.addEventListener('click', () => switchTab('upcoming'));
    tabClosed.addEventListener('click', () => switchTab('closed'));
    document.body.addEventListener('click', handleDetailClick);
    
    [detailModal, registerModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal(modal);
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal(detailModal);
            hideModal(registerModal);
        }
    });

    // --- Inisialisasi ---
    fetchAndRenderPrograms();
});

