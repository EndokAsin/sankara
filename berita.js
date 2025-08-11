import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SETUP SUPABASE CLIENT ---
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI ELEMENTS ---
const loader = document.getElementById('news-loader');
const container = document.getElementById('news-container');
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- FUNCTIONS ---

/**
 * Merender daftar berita ke dalam container.
 * @param {Array} newsItems - Array berisi data berita dari Supabase.
 */
function renderNews(newsItems) {
    if (!container) return;

    if (newsItems.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600 col-span-full">Belum ada berita yang dipublikasikan.</p>`;
        return;
    }

    let newsHTML = '';
    newsItems.forEach((item, index) => {
        const publishedDate = new Date(item.published_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        newsHTML += `
            <div class="fade-in-element bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col text-left transition-transform duration-300 hover:-translate-y-2" style="animation-delay: ${index * 100}ms;">
                <img 
                    src="${item.image_url || 'https://placehold.co/600x400/DCFCE7/16A34A?text=Berita'}" 
                    alt="Gambar Berita ${item.title}" 
                    class="w-full h-56 object-cover"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/333?text=Gambar+Error';"
                />
                <div class="p-6 flex flex-col flex-grow">
                    <p class="text-sm text-gray-500 mb-2">${publishedDate}</p>
                    <h3 class="text-xl font-bold text-sankara-dark mb-3">${item.title}</h3>
                    <p class="text-gray-600 mb-6 flex-grow text-sm">${item.summary || ''}</p>
                    <a 
                        href="#" <!-- Ganti dengan link ke detail berita jika ada -->
                        class="mt-auto inline-block self-start text-sankara-green-dark font-semibold hover:underline"
                    >
                        Baca Selengkapnya →
                    </a>
                </div>
            </div>
        `;
    });
    container.innerHTML = newsHTML;
}

/**
 * Mengambil semua berita dari Supabase.
 */
async function fetchAllNews() {
    try {
        const { data, error } = await supabase.from('news').select('*').order('published_at', { ascending: false });
        if (error) throw error;

        if (loader) loader.style.display = 'none';
        renderNews(data);

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

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', fetchAllNews);
