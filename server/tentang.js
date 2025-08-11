import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SETUP SUPABASE CLIENT ---
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI ELEMENTS ---
const aboutContentEl = document.getElementById('about-content');
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- FUNCTIONS ---

/**
 * Mengambil dan menampilkan konten "Apa itu Sankara".
 */
async function fetchAboutContent() {
    if (!aboutContentEl) return;
    const { data, error } = await supabase.from('site_content').select('value').eq('key', 'about_sankara').single();
    if (error) {
        console.error("Error fetching about content:", error);
        aboutContentEl.innerHTML = '<p>Gagal memuat deskripsi.</p>';
    } else {
        // Mengganti newline (\n) dengan tag <p> untuk paragraf
        const content = data?.value || 'Deskripsi default Sankara.';
        const paragraphs = content.split('\n').map(p => `<p>${p}</p>`).join('');
        aboutContentEl.innerHTML = paragraphs;
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
document.addEventListener('DOMContentLoaded', fetchAboutContent);
