// --- UI ELEMENTS ---
const aboutButton = document.getElementById('about-dropdown-button');
const aboutMenu = document.getElementById('about-dropdown-menu');
const aboutContainer = document.getElementById('about-dropdown-container');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

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
