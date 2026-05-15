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
            const apiRes = await fetch(`/api/posts?t=${Date.now()}`);
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
    const categoryLinks = document.querySelectorAll('.category-list li a');
    if (categoryLinks.length === 0) return;

    // Add 'All' link if not present
    const categoryList = document.querySelector('.category-list');
    if (!Array.from(categoryLinks).some(a => a.textContent.includes('Hepsi'))) {
        const allLi = document.createElement('li');
        allLi.innerHTML = `<a href="#">Hepsi</a><span class="category-count">${Object.keys(posts).length}</span>`;
        categoryList.prepend(allLi);
    }

    // Update the dynamic category links
    document.querySelectorAll('.category-list li a').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const selectedCategory = link.textContent.trim();
            
            // UI Feedback
            document.querySelectorAll('.category-list li a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            
            filterByCategory(selectedCategory);
        };
    });
}

function filterByCategory(category) {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach(card => {
        const cardCat = (card.getAttribute('data-category') || '').toLowerCase().trim();
        const selectedCat = category.toLowerCase().trim();

        if (selectedCat === 'hepsi' || cardCat.includes(selectedCat) || selectedCat.includes(cardCat)) {
            card.classList.remove('hidden');
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

    // Check if comments section already exists to avoid duplication
    if (document.querySelector('.comments-section')) return;

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
    
    const mainContainer = document.querySelector('.main-content .container');
    if (mainContainer) mainContainer.appendChild(commentsSection);

    // Initial load
    loadComments(postBody);

    // Auto-refresh comments every 30 seconds
    const refreshInterval = setInterval(() => {
        if (document.body.contains(commentsSection)) {
            loadComments(postBody);
        } else {
            clearInterval(refreshInterval);
        }
    }, 30000);

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
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment)
            });
            
            if (res.ok) {
                document.getElementById('comment-text').value = '';
                // Immediate refresh after posting
                setTimeout(() => loadComments(postBody), 500);
            }
        } catch (e) {
            console.error('API Error, saving locally:', e);
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            comments.push(comment);
            localStorage.setItem('comments', JSON.stringify(comments));
            loadComments(postBody);
        }
    };
}

async function loadComments(postId) {
    console.log('Loading comments for:', postId);
    const list = document.getElementById('comments-list');
    if (!list) return;

    let allComments = [];
    try {
        const res = await fetch(`/api/comments?t=${Date.now()}`);
        if (res.ok) {
            allComments = await res.json();
            console.log('Comments fetched from API:', allComments);
        } else {
            console.error('API responded with error:', res.status);
        }
    } catch (e) {
        console.error('Fetch error, falling back to local storage:', e);
        allComments = JSON.parse(localStorage.getItem('comments') || '[]');
    }

    // Ensure allComments is an array
    if (!Array.isArray(allComments)) {
        console.error('Data format error: expected array but got', typeof allComments);
        allComments = [];
    }

    const postComments = allComments.filter(c => c.postId === postId);
    console.log('Filtered comments for this post:', postComments);
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
let editingPostId = null;

function initAdmin() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            if (user === 'admin' && pass === '1234') {
                localStorage.setItem('isAdmin', 'true');
                window.location.href = 'index.html'; // Redirect to home instead of admin.html
            } else {
                document.getElementById('login-error').classList.remove('hidden');
            }
        };
    }

    // Update Navbar for Admin
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        if (isAdmin) {
            // Replace Login with Logout and Add New Post link
            const loginLink = Array.from(navLinks.querySelectorAll('a')).find(a => a.href.includes('login.html'));
            if (loginLink) {
                const li = loginLink.parentElement;
                li.innerHTML = '<a href="#" id="logout-btn">Çıkış Yap</a>';
                
                const newPostLi = document.createElement('li');
                newPostLi.innerHTML = '<a href="#" id="open-post-form">Yeni Yazı</a>';
                navLinks.insertBefore(newPostLi, li);
            }
        }
    }

    // Logout handling (available on all pages)
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'logout-btn') {
            e.preventDefault();
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        }
        
        if (e.target && e.target.id === 'open-post-form') {
            e.preventDefault();
            showPostForm();
        }
    });

    if (isAdmin) {
        addAdminControlsToPosts();
    }
}

function showPostForm(existingData = null) {
    // Create or show post form overlay
    let overlay = document.getElementById('admin-post-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'admin-post-overlay';
        overlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; display:flex; justify-content:center; align-items:center; padding:20px;';
        overlay.innerHTML = `
            <div class="admin-section" style="width:100%; max-width:800px; max-height:90vh; overflow-y:auto; position:relative;">
                <button onclick="document.getElementById('admin-post-overlay').remove()" style="position:absolute; right:20px; top:20px; background:none; border:none; color:var(--primary-color); font-size:1.5rem; cursor:pointer;">✕</button>
                <h3 id="form-title">${existingData ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}</h3>
                <form id="new-post-form-overlay">
                    <div class="form-group">
                        <label for="post-title">Yazı Başlığı</label>
                        <input type="text" id="post-title" required value="${existingData ? existingData.title : ''}">
                    </div>
                    <div class="form-group">
                        <label for="post-category">Kategori</label>
                        <input type="text" id="post-category" required placeholder="Örn: Kültür" value="${existingData ? existingData.category : ''}">
                    </div>
                    <div class="form-group">
                        <label for="post-image">Görsel URL</label>
                        <input type="url" id="post-image" required value="${existingData ? existingData.image : ''}">
                    </div>
                    <div class="form-group">
                        <label for="post-content">İçerik (HTML desteklenir)</label>
                        <textarea id="post-content" rows="10" required>${existingData ? existingData.content : ''}</textarea>
                    </div>
                    <button type="submit" class="submit-btn">${existingData ? 'Güncelle' : 'Yayınla'}</button>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        
        const form = document.getElementById('new-post-form-overlay');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value;
            const cat = document.getElementById('post-category').value;
            const img = document.getElementById('post-image').value;
            const content = document.getElementById('post-content').value;

            const postId = editingPostId || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            const postData = { title, category: cat, image: img, content };

            try {
                await fetch('/api/posts', {
                    method: editingPostId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, postData })
                });
                alert(editingPostId ? 'Yazı başarıyla güncellendi!' : 'Yazı başarıyla eklendi!');
                overlay.remove();
                editingPostId = null;
                location.reload(); // Refresh to see changes
            } catch (e) {
                console.error('API Error:', e);
                alert('İşlem başarısız oldu.');
            }
        };
    }
}

function addAdminControlsToPosts() {
    // Add edit/delete buttons to blog cards
    document.querySelectorAll('.blog-card').forEach(async card => {
        const postId = card.getAttribute('data-post-id');
        if (!postId) return;

        // Check if it's a dynamic post from API
        const res = await fetch('/api/posts');
        const dynamicPosts = await res.json();
        
        if (dynamicPosts[postId]) {
            const actions = document.createElement('div');
            actions.className = 'admin-post-actions';
            actions.style = 'padding: 0 2.5rem 2.5rem; display: flex; gap: 10px;';
            actions.innerHTML = `
                <button class="edit-btn" style="flex:1">Düzenle</button>
                <button class="delete-btn" style="flex:1">Sil</button>
            `;
            card.appendChild(actions);

            actions.querySelector('.edit-btn').onclick = () => {
                editingPostId = postId;
                showPostForm(dynamicPosts[postId]);
            };

            actions.querySelector('.delete-btn').onclick = async () => {
                if (confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
                    await fetch(`/api/posts?postId=${postId}`, { method: 'DELETE' });
                    location.reload();
                }
            };
        }
    });
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
