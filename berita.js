import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = 'https://vfdxtujestpslpsvdkwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHh0dWplc3Rwc2xwc3Zka3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTM1MTksImV4cCI6MjA3MDM4OTUxOX0.yJxlRUB1w7KS1bADPNnIaMNj3NRyjBWoJQFu2QJtknw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;
let allNews = []; // Cache untuk menyimpan semua data berita

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

// --- LOGIKA HALAMAN BERITA ---

const openNewsModal = (articleId) => {
    const article = allNews.find(a => a.id === articleId);
    if (!article) return;

    const modal = document.getElementById('news-detail-modal');
    const modalContent = document.getElementById('news-detail-modal-content');

    modalContent.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-sankara-dark">${article.title}</h2>
            <button id="close-news-modal" class="text-gray-500 text-3xl leading-none hover:text-gray-800">&times;</button>
        </div>
        <img src="${article.image_url || 'https://placehold.co/600x400/dcfce7/1e293b?text=Berita'}" alt="${article.title}" class="w-full h-64 object-cover rounded-lg mb-4">
        <p class="text-gray-500 text-xs mb-4">Dipublikasikan pada ${new Date(article.created_at).toLocaleDateString('id-ID')}</p>
        <div class="prose max-w-none text-gray-700">
            ${article.content || 'Konten tidak tersedia.'}
        </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('close-news-modal').addEventListener('click', () => modal.classList.add('hidden'));
};


const fetchAndRenderNews = async () => {
    const container = document.getElementById('news-list-container');
    if (!container) return;
    container.innerHTML = '<p class="text-center col-span-full">Memuat berita...</p>';

    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allNews = data; // Simpan data ke cache

        if (data.length === 0) {
            container.innerHTML = '<p class="text-center col-span-full text-gray-500">Belum ada berita yang dipublikasikan.</p>';
            return;
        }

        container.innerHTML = data.map(article => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                <img src="${article.image_url || 'https://placehold.co/600x400/dcfce7/1e293b?text=Berita'}" alt="${article.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-sankara-dark mb-2 line-clamp-2">${article.title}</h3>
                    <p class="text-gray-500 text-xs mb-4">Dipublikasikan pada ${new Date(article.created_at).toLocaleDateString('id-ID')}</p>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-4">${article.content || ''}</p>
                    <button data-article-id="${article.id}" class="read-more-btn font-semibold text-sankara-green-dark hover:underline">Baca Selengkapnya &rarr;</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Gagal memuat berita:", error);
        container.innerHTML = '<p class="text-center text-red-500 col-span-full">Gagal memuat berita.</p>';
    }
};


// --- FUNGSI MEMUAT FOOTER ---
const setupFooter = () => {
    const footer = document.getElementById('contact');
    if (!footer) return;
    footer.innerHTML = `
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div>
                    <h3 class="text-lg font-bold mb-4">SANKARA</h3>
                    <p class="text-gray-400 text-sm">Sebuah platform yang didedikasikan untuk menghubungkan kebaikan dan menciptakan perubahan positif.</p>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-4">Tautan Cepat</h3>
                    <ul class="space-y-2 text-sm">
                        <li><a href="tentang.html" class="text-gray-400 hover:text-white">Tentang Kami</a></li>
                        <li><a href="program.html" class="text-gray-400 hover:text-white">Program</a></li>
                        <li><a href="berita.html" class="text-gray-400 hover:text-white">Berita</a></li>
                        <li><a href="mitra.html" class="text-gray-400 hover:text-white">Mitra</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-4">Hubungi Kami</h3>
                    <ul class="space-y-3 text-sm text-gray-400">
                        <li class="flex items-start">
                            <svg class="w-5 h-5 mr-3 mt-1 text-sankara-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>Jl. Kebaikan No. 123, Jakarta</span>
                        </li>
                        <li class="flex items-center">
                            <svg class="w-5 h-5 mr-3 text-sankara-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span>info@sankara.org</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-4">Ikuti Kami</h3>
                    <div class="flex space-x-4">
                        <a href="#" class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-sankara-green"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg></a>
                        <a href="#" class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-sankara-green"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.148 2 12.315 2zM8 12a4 4 0 118 0 4 4 0 01-8 0zm4-6a6 6 0 100 12 6 6 0 000-12z"></path></svg></a>
                        <a href="#" class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-sankara-green"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.78 22 12 22 12s0 3.22-.418 4.814a2.504 2.504 0 01-1.768 1.768C18.39 19 12 19 12 19s-6.39 0-7.814-.418a2.504 2.504 0 01-1.768-1.768C2.002 15.22 2 12 2 12s0-3.22.418-4.814a2.504 2.504 0 011.768-1.768C5.61 5 12 5 12 5s6.39 0 7.812.418zM9.75 15.5V8.5l6 3.5-6 3.5z"></path></svg></a>
                    </div>
                </div>
            </div>
            <div class="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
                <p>&copy; 2024 Sankara. Seluruh Hak Cipta.</p>
            </div>
        </div>
    `;
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI();
    setupUIInteractions();
    setupFooter();
    fetchAndRenderNews();

    // Event listener untuk tombol "Baca Selengkapnya"
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('read-more-btn')) {
            const articleId = e.target.dataset.articleId;
            openNewsModal(articleId);
        }
        // Menutup modal jika mengklik area luar (backdrop)
        if (e.target.id === 'news-detail-modal') {
            e.target.classList.add('hidden');
        }
    });
});

