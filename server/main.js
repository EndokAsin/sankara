import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SETUP SUPABASE CLIENT ---
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI INTERACTION ---
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

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


// --- DATA FETCHING ---
const aboutContentEl = document.getElementById('about-content');
const eventsContainerEl = document.getElementById('events-container');
const eventsLoaderEl = document.getElementById('events-loader');

/**
 * Mengambil dan menampilkan konten "Apa itu Sankara".
 */
async function fetchAboutContent() {
    if (!aboutContentEl) return;
    const { data, error } = await supabase.from('site_content').select('value').eq('key', 'about_sankara').single();
    if (error) {
        console.error("Error fetching about content:", error);
        aboutContentEl.textContent = 'Gagal memuat deskripsi.';
    } else {
        aboutContentEl.textContent = data?.value || 'Deskripsi default Sankara.';
    }
}

/**
 * Mengambil dan menampilkan program/event yang aktif di halaman utama.
 */
async function fetchActiveEvents() {
    if (!eventsContainerEl || !eventsLoaderEl) return;

    try {
        const today = new Date().toISOString();
        // Mengambil 3 event terdekat
        const { data, error } = await supabase.from('events').select('*').gte('end_date', today).order('start_date', { ascending: true }).limit(3);
        if (error) throw error;

        eventsLoaderEl.style.display = 'none';

        if (data.length === 0) {
            eventsContainerEl.innerHTML = '<p class="text-center text-gray-600 col-span-full">Belum ada program yang akan datang.</p>';
            return;
        }

        let eventsHTML = '';
        data.forEach((event, index) => {
            eventsHTML += `
                <div class="fade-in-element bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col text-center transition-transform duration-300 hover:-translate-y-2" style="animation-delay: ${index * 150}ms;">
                    <img 
                        src="${event.poster_url || 'https://placehold.co/600x400/DCFCE7/16A34A?text=Program'}" 
                        alt="Poster ${event.title}" 
                        class="w-full h-56 object-cover"
                        onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/333?text=Poster+Error';"
                    />
                    <div class="p-8 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-sankara-dark mb-2">${event.title}</h3>
                        <p class="text-gray-600 mb-6 flex-grow">${event.description || ''}</p>
                        <a 
                            href="${event.registration_link}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="mt-auto inline-block self-center bg-sankara-green-light text-sankara-green-dark font-semibold py-2 px-6 rounded-full hover:bg-sankara-green hover:text-white transition-all duration-300"
                        >
                            Pelajari Lebih Lanjut
                        </a>
                    </div>
                </div>
            `;
        });
        eventsContainerEl.innerHTML = eventsHTML;
    } catch (err) {
        eventsLoaderEl.textContent = `Gagal memuat data: ${err.message}`;
        eventsLoaderEl.classList.add('text-red-500');
    }
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAboutContent();
    fetchActiveEvents();
});
