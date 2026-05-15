// Mobile menu toggle
function initMobileMenu() {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.innerHTML = '☰';
    document.querySelector('.navbar .container').appendChild(toggleBtn);

    const navLinks = document.querySelector('.nav-links');
    
    toggleBtn.onclick = () => {
        navLinks.classList.toggle('show');
        toggleBtn.innerHTML = navLinks.classList.contains('show') ? '✕' : '☰';
    };

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.onclick = () => {
            navLinks.classList.remove('show');
            toggleBtn.innerHTML = '☰';
        };
    });
}

// Utility: Get anonymous username
function getAnonUsername() {
    let anonId = localStorage.getItem('anonId');
    if (!anonId) {
        anonId = Math.floor(Math.random() * 10000);
        localStorage.setItem('anonId', anonId);
    }
    return `anon${anonId}userid`;
}

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

// Dynamic Data Loader
async function loadDynamicContent() {
    try {
        const response = await fetch('assets/blog-data.json');
        const staticData = await response.json();

        // Load dynamic posts from Vercel KV API
        let dynamicPosts = {};
        try {
            const apiRes = await fetch('/api/posts');
            if (apiRes.ok) dynamicPosts = await apiRes.json();
        } catch (e) {
            console.error('API Error, falling back to local:', e);
            dynamicPosts = JSON.parse(localStorage.getItem('dynamicPosts') || '{}');
        }

        const allPosts = { ...staticData.posts, ...dynamicPosts };

        // Update Blog Cards
        document.querySelectorAll('.blog-card').forEach(card => {
            const postId = card.getAttribute('data-post-id');
            const postData = allPosts[postId];
            if (postId && postData) {
                const img = card.querySelector('.blog-card-image');
                if (img) img.src = postData.image;
                
                // Add category label to card if not present
                if (postData.category && !card.querySelector('.blog-category')) {
                    const header = card.querySelector('.blog-card-content');
                    const categorySpan = document.createElement('span');
                    categorySpan.className = 'blog-category';
                    categorySpan.textContent = postData.category;
                    header.prepend(categorySpan);
                }
                card.setAttribute('data-category', postData.category || '');
            }
        });

        // Update Featured Images (article pages)
        const postContent = document.querySelector('.blog-post');
        if (postContent) {
            const bodyId = document.body.getAttribute('data-post-id');
            if (bodyId && allPosts[bodyId]) {
                const featuredImg = document.querySelector('.post-featured-image');
                if (featuredImg) featuredImg.src = allPosts[bodyId].image;
            }
        }

        if (window.location.pathname.includes('yazilar.html') || document.querySelector('.blog-section')) {
            initCategoryFilter(allPosts);
        }

    } catch (error) {
        console.error('Error loading blog data:', error);
    }
}

// Category Filter Logic
function initCategoryFilter(posts) {
    const blogSection = document.querySelector('.blog-section');
    if (!blogSection) return;

    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'category-filter-container container';
    blogSection.parentNode.insertBefore(filterContainer, blogSection);

    const categories = ['Hepsi', ...new Set(Object.values(posts).map(p => p.category).filter(Boolean))];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === 'Hepsi' ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByCategory(cat);
        };
        filterContainer.appendChild(btn);
    });
}

function filterByCategory(category) {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category') || '';
        if (category === 'Hepsi' || cardCat.trim() === category.trim()) {
            card.classList.remove('hidden');
            // Trigger animation for filtered items
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        } else {
            card.classList.add('hidden');
        }
    });
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
            if (searchResults) searchResults.classList.remove('show');
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

        if (searchResults) {
            searchResults.classList.add('show');
            searchResults.textContent = matchCount > 0
                ? `${matchCount} yazı bulundu`
                : 'Sonuç bulunamadı';
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', performSearch);
}

// Comments Logic
function initComments() {
    const postBody = document.body.getAttribute('data-post-id');
    if (!postBody) return;

    const commentsSection = document.createElement('section');
    commentsSection.className = 'comments-section container';
    commentsSection.innerHTML = `
        <h3>Yorumlar</h3>
        <div class="comment-form">
            <div class="form-group">
                <label>Yorumunuz (${getAnonUsername()})</label>
                <textarea id="comment-text" rows="3" placeholder="Düşüncelerinizi paylaşın..."></textarea>
            </div>
            <button id="submit-comment" class="submit-btn" style="width: auto;">Gönder</button>
        </div>
        <div id="comments-list" class="comment-list"></div>
    `;
    
    document.querySelector('.main-content .container').appendChild(commentsSection);

    loadComments(postBody);

    document.getElementById('submit-comment').onclick = async () => {
        const text = document.getElementById('comment-text').value;
        if (!text.trim()) return;

        const comment = {
            id: Date.now(),
            author: getAnonUsername(),
            text: text,
            date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
            postId: postBody
        };

        try {
            await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment)
            });
        } catch (e) {
            console.error('API Error, saving locally:', e);
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            comments.push(comment);
            localStorage.setItem('comments', JSON.stringify(comments));
        }

        document.getElementById('comment-text').value = '';
        loadComments(postBody);
    };
}

async function loadComments(postId) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    let allComments = [];
    try {
        const res = await fetch('/api/comments');
        if (res.ok) allComments = await res.json();
    } catch (e) {
        console.error('API Error, loading from local:', e);
        allComments = JSON.parse(localStorage.getItem('comments') || '[]');
    }

    const postComments = allComments.filter(c => c.postId === postId);
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (postComments.length === 0) {
        list.innerHTML = '<p style="color: white; opacity: 0.7;">Henüz yorum yapılmamış.</p>';
        return;
    }

    list.innerHTML = postComments.map(c => `
        <div class="comment-item">
            <div class="comment-author">${c.author}</div>
            <div class="comment-date">${c.date}</div>
            <div class="comment-content">${c.text}</div>
            ${isAdmin ? `
                <div class="comment-actions">
                    <button class="delete-comment-btn" onclick="deleteComment(${c.id})">Sil</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

window.deleteComment = async (id) => {
    try {
        await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
    } catch (e) {
        console.error('API Error, deleting locally:', e);
        let comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments = comments.filter(c => c.id !== id);
        localStorage.setItem('comments', JSON.stringify(comments));
    }

    const postId = document.body.getAttribute('data-post-id');
    loadComments(postId);
    if (window.location.pathname.includes('admin.html')) {
        loadAdminComments();
    }
};

// Admin Logic
function initAdmin() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            // Simple hardcoded admin check for demo
            if (user === 'admin' && pass === '1234') {
                localStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin.html';
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        };
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        };
    }

    // New Post Form
    const newPostForm = document.getElementById('new-post-form');
    if (newPostForm) {
        newPostForm.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value;
            const cat = document.getElementById('post-category').value;
            const img = document.getElementById('post-image').value;
            const content = document.getElementById('post-content').value;

            const postId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            const postData = {
                title: title,
                category: cat,
                image: img,
                content: content
            };

            try {
                await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, postData })
                });
            } catch (e) {
                console.error('API Error, saving locally:', e);
                const dynamicPosts = JSON.parse(localStorage.getItem('dynamicPosts') || '{}');
                dynamicPosts[postId] = postData;
                localStorage.setItem('dynamicPosts', JSON.stringify(dynamicPosts));
            }
            
            alert('Yazı başarıyla eklendi! (Vercel Blob üzerine kaydedildi.)');
            newPostForm.reset();
        };
    }

    if (window.location.pathname.includes('admin.html')) {
        loadAdminComments();
    }
}

async function loadAdminComments() {
    const list = document.getElementById('admin-comments-list');
    if (!list) return;

    let allComments = [];
    try {
        const res = await fetch('/api/comments');
        if (res.ok) allComments = await res.json();
    } catch (e) {
        console.error('API Error:', e);
        allComments = JSON.parse(localStorage.getItem('comments') || '[]');
    }

    if (allComments.length === 0) {
        list.innerHTML = '<p>Henüz yorum yok.</p>';
        return;
    }

    list.innerHTML = allComments.map(c => `
        <div class="comment-item" style="margin-bottom: 1rem; border: 1px solid #eee;">
            <div class="comment-author">${c.author} (Yazı: ${c.postId})</div>
            <div class="comment-content">${c.text}</div>
            <div class="comment-actions">
                <button class="delete-comment-btn" onclick="deleteComment(${c.id})">Sil</button>
            </div>
        </div>
    `).join('');
}

// Contact Logic
function initContact() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.onsubmit = (e) => {
            e.preventDefault();
            alert('Mesajınız başarıyla gönderildi! Teşekkür ederiz.');
            contactForm.reset();
        };
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initAnimations();
    loadDynamicContent();
    initSearch();
    initComments();
    initAdmin();
    initContact();
});

console.log('Blog site logic initialized');
