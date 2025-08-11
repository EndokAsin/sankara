import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SETUP SUPABASE CLIENT ---
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI ELEMENTS ---
const loader = document.getElementById('partners-loader');
const container = document.getElementById('partners-container');
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- FUNCTIONS ---

/**
 * Merender daftar mitra ke dalam container.
 * @param {Array} partners - Array berisi data mitra dari Supabase.
 */
function renderPartners(partners) {
    if (!container) return;

    if (partners.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600 col-span-full">Belum ada mitra yang terdaftar.</p>`;
        return;
    }

    let partnersHTML = '';
    partners.forEach((partner, index) => {
        partnersHTML += `
            <div class="fade-in-element flex justify-center items-center p-4 bg-white rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-2" style="animation-delay: ${index * 100}ms;">
                <a href="${partner.website_url || '#'}" target="_blank" rel="noopener noreferrer">
                    <img 
                        src="${partner.logo_url || 'https://placehold.co/200x100/DCFCE7/16A34A?text=Mitra'}" 
                        alt="Logo ${partner.name}" 
                        class="max-h-20 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                        onerror="this.onerror=null;this.src='https://placehold.co/200x100/f0f0f0/333?text=Logo+Error';"
                    />
                </a>
            </div>
        `;
    });
    container.innerHTML = partnersHTML;
}

/**
 * Mengambil semua data mitra dari Supabase.
 */
async function fetchAllPartners() {
    try {
        const { data, error } = await supabase.from('partners').select('*');
        if (error) throw error;

        if (loader) loader.style.display = 'none';
        renderPartners(data);

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
document.addEventListener('DOMContentLoaded', fetchAllPartners);
