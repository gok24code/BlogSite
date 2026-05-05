// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation to blog cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

function initAnimations() {
    document.querySelectorAll('.blog-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Dynamic Image Loader from JSON
async function loadDynamicImages() {
    try {
        const response = await fetch('assets/blog-data.json');
        const data = await response.json();

        // Update Blog Cards (index.html and yazilar.html)
        document.querySelectorAll('.blog-card').forEach(card => {
            const postId = card.getAttribute('data-post-id');
            if (postId && data.posts[postId]) {
                const img = card.querySelector('.blog-card-image');
                if (img) img.src = data.posts[postId].image;
            }
        });

        // Update Featured Images (article pages)
        const postContent = document.querySelector('.blog-post');
        if (postContent) {
            const bodyId = document.body.getAttribute('data-post-id');
            if (bodyId && data.posts[bodyId]) {
                const featuredImg = document.querySelector('.post-featured-image');
                if (featuredImg) featuredImg.src = data.posts[bodyId].image;
            }
        }
    } catch (error) {
        console.error('Error loading blog data:', error);
    }
}

// Mobile menu toggle (if needed in future)
function initMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobile-specific behavior can be added here
    }
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');

    if (!searchInput) return;

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const blogCards = document.querySelectorAll('.blog-card');
        let matchCount = 0;

        if (query.length === 0) {
            blogCards.forEach(card => card.classList.remove('hidden'));
            searchResults.classList.remove('show');
            return;
        }

        blogCards.forEach(card => {
            const title = card.querySelector('.blog-title')?.textContent.toLowerCase() || '';
            const excerpt = card.querySelector('.blog-excerpt')?.textContent.toLowerCase() || '';
            const meta = card.querySelector('.post-meta')?.textContent.toLowerCase() || '';

            const matches = title.includes(query) || excerpt.includes(query) || meta.includes(query);

            if (matches) {
                card.classList.remove('hidden');
                matchCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        searchResults.classList.add('show');
        searchResults.textContent = matchCount > 0
            ? `${matchCount} yazı bulundu`
            : 'Sonuç bulunamadı';
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initAnimations();
    loadDynamicImages();
    initSearch();
});

window.addEventListener('resize', initMobileMenu);

console.log('Blog site loaded successfully');
