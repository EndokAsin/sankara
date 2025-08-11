import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- SETUP SUPABASE CLIENT ---
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- UI ELEMENTS ---
const loader = document.getElementById('reports-loader');
const container = document.getElementById('reports-container');
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// --- FUNCTIONS ---

/**
 * Merender daftar laporan ke dalam container.
 * @param {Array} reports - Array berisi data laporan dari Supabase.
 */
function renderReports(reports) {
    if (!container) return;

    if (reports.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600">Belum ada laporan yang dipublikasikan.</p>`;
        return;
    }

    let reportsHTML = '';
    reports.forEach((report, index) => {
        reportsHTML += `
            <div class="fade-in-element bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center transition-transform duration-300 hover:-translate-y-1" style="animation-delay: ${index * 100}ms;">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-sankara-green-light rounded-lg flex items-center justify-center mr-4">
                        <svg class="w-6 h-6 text-sankara-green-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-sankara-dark">${report.title}</h3>
                        <p class="text-sm text-gray-500">Tahun ${report.year}</p>
                    </div>
                </div>
                <a 
                    href="${report.file_url}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="bg-sankara-green-light text-sankara-green-dark font-semibold py-2 px-4 rounded-full hover:bg-sankara-green hover:text-white transition-all duration-300"
                >
                    Unduh PDF
                </a>
            </div>
        `;
    });
    container.innerHTML = reportsHTML;
}

/**
 * Mengambil semua data laporan dari Supabase.
 */
async function fetchAllReports() {
    try {
        const { data, error } = await supabase.from('annual_reports').select('*').order('year', { ascending: false });
        if (error) throw error;

        if (loader) loader.style.display = 'none';
        renderReports(data);

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
document.addEventListener('DOMContentLoaded', fetchAllReports);
