import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SETUP SUPABASE CLIENT ---
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI ELEMENTS ---
const loader = document.getElementById('events-loader');
const tabUpcomingBtn = document.getElementById('tab-upcoming');
const tabClosedBtn = document.getElementById('tab-closed');
const contentUpcoming = document.getElementById('content-upcoming');
const contentClosed = document.getElementById('content-closed');
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- FUNCTIONS ---

/**
 * Merender daftar event ke dalam container yang ditentukan.
 * @param {HTMLElement} container - Elemen DOM untuk menampung kartu event.
 * @param {Array} events - Array berisi data event dari Supabase.
 * @param {boolean} [isClosed=false] - Menandakan apakah event sudah selesai.
 */
function renderEvents(container, events, isClosed = false) {
    if (!container) return; // Guard clause jika container tidak ditemukan

    if (events.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600 col-span-full">Tidak ada program di kategori ini.</p>`;
        return;
    }

    let eventsHTML = '';
    events.forEach((event, index) => {
        const buttonClass = isClosed 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-sankara-green-light text-sankara-green-dark font-semibold hover:bg-sankara-green hover:text-white';
        const buttonText = isClosed ? 'Telah Selesai' : 'Pelajari Lebih Lanjut';

        eventsHTML += `
            <div class="fade-in-element bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col text-center transition-transform duration-300 hover:-translate-y-2" style="animation-delay: ${index * 100}ms;">
                <img 
                    src="${event.poster_url || 'https://placehold.co/600x400/DCFCE7/16A34A?text=Program'}" 
                    alt="Poster ${event.title}" 
                    class="w-full h-56 object-cover ${isClosed ? 'grayscale' : ''}"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/333?text=Poster+Error';"
                />
                <div class="p-8 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold text-sankara-dark mb-2">${event.title}</h3>
                    <p class="text-gray-600 mb-6 flex-grow">${event.description || ''}</p>
                    <a 
                        href="${isClosed ? '#' : event.registration_link}" 
                        ${isClosed ? '' : 'target="_blank" rel="noopener noreferrer"'}
                        class="mt-auto inline-block self-center py-2 px-6 rounded-full transition-all duration-300 ${buttonClass}"
                    >
                        ${buttonText}
                    </a>
                </div>
            </div>
        `;
    });
    container.innerHTML = eventsHTML;
}

/**
 * Mengambil semua event dari Supabase dan membaginya ke tab yang sesuai.
 */
async function fetchAllEvents() {
    try {
        const { data, error } = await supabase.from('events').select('*').order('start_date', { ascending: false });
        if (error) throw error;

        if (loader) loader.style.display = 'none';

        const today = new Date();
        const upcomingEvents = data.filter(event => new Date(event.end_date) >= today);
        const closedEvents = data.filter(event => new Date(event.end_date) < today);

        renderEvents(contentUpcoming, upcomingEvents);
        renderEvents(contentClosed, closedEvents, true);

    } catch (err) {
        if (loader) {
            loader.textContent = `Gagal memuat data: ${err.message}`;
            loader.classList.add('text-red-500');
        }
    }
}

// --- EVENT LISTENERS ---
// Dropdown Logic
if (aboutButton && aboutMenu && aboutContainer) {
    aboutButton.addEventListener('click', (event) => {
        event.stopPropagation();
        aboutMenu.classList.toggle('hidden');
    });

    window.addEventListener('click', (event) => {
        if (!aboutContainer.contains(event.target)) {
            aboutMenu.classList.add('hidden');
        }
    });
}

// Mobile Menu Logic
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Tab Logic
if (tabUpcomingBtn && tabClosedBtn) {
    tabUpcomingBtn.addEventListener('click', () => {
        // Atur gaya tombol
        tabUpcomingBtn.classList.add('tab-active');
        tabUpcomingBtn.classList.remove('border-transparent', 'text-gray-500');
        tabClosedBtn.classList.remove('tab-active');
        tabClosedBtn.classList.add('border-transparent', 'text-gray-500');

        // Tampilkan konten yang sesuai
        if (contentUpcoming) contentUpcoming.classList.remove('hidden');
        if (contentUpcoming) contentUpcoming.classList.add('grid');
        if (contentClosed) contentClosed.classList.add('hidden');
    });

    tabClosedBtn.addEventListener('click', () => {
        // Atur gaya tombol
        tabClosedBtn.classList.add('tab-active');
        tabClosedBtn.classList.remove('border-transparent', 'text-gray-500');
        tabUpcomingBtn.classList.remove('tab-active');
        tabUpcomingBtn.classList.add('border-transparent', 'text-gray-500');

        // Tampilkan konten yang sesuai
        if (contentClosed) contentClosed.classList.remove('hidden');
        if (contentClosed) contentClosed.classList.add('grid');
        if (contentUpcoming) contentUpcoming.classList.add('hidden');
    });
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', fetchAllEvents);
