document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');
    const navbar = document.getElementById('navbar');

    function switchPage(pageName) {
        pages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        navLinks.forEach(link => link.classList.remove('active'));

        const targetPage = document.getElementById('page-' + pageName);
        if (targetPage) {
            targetPage.style.display = 'block';
            setTimeout(() => {
                targetPage.classList.add('active');
            }, 10);
        }

        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        navLinksContainer.classList.remove('active');
        hamburger.classList.remove('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            switchPage(pageName);
        });
    });

    document.querySelectorAll('.btn[data-page]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            switchPage(pageName);
        });
    });

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // Close hamburger menu when tapping outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navLinksContainer.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    // Close hamburger menu on nav link tap (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // ============================================
    // DONATIONS - Live from Google Sheets
    // ============================================
    var donationsCache = {};

    function parseCSV(csv) {
        var lines = csv.split('\n').filter(function(l) { return l.trim(); });
        if (lines.length < 2) return { headers: [], rows: [] };
        var headers = lines[0].split(',').map(function(h) { return h.trim().replace(/^"|"$/g, ''); });
        var rows = [];
        for (var i = 1; i < lines.length; i++) {
            var cols = lines[i].split(',').map(function(c) { return c.trim().replace(/^"|"$/g, ''); });
            if (cols.length >= headers.length || cols.join('')) {
                var row = {};
                headers.forEach(function(h, idx) {
                    row[h] = cols[idx] || '';
                });
                rows.push(row);
            }
        }
        return { headers: headers, rows: rows };
    }

    function fetchSheetData(key) {
        if (donationsCache[key]) return Promise.resolve(donationsCache[key]);
        if (typeof DONATIONS_SHEETS === 'undefined') return Promise.resolve(null);
        var url = DONATIONS_SHEETS[key].sheetUrl;
        return fetch(url)
            .then(function(res) { return res.text(); })
            .then(function(csv) {
                var data = parseCSV(csv);
                donationsCache[key] = data;
                return data;
            })
            .catch(function() { return null; });
    }

    function renderDonationCards() {
        var container = document.getElementById('donationCards');
        if (!container || typeof DONATIONS_SHEETS === 'undefined') return;
        
        container.innerHTML = '';
        Object.keys(DONATIONS_SHEETS).forEach(function(key) {
            var item = DONATIONS_SHEETS[key];
            var card = document.createElement('div');
            card.className = 'don-card don-card-clickable';
            card.setAttribute('data-donation-modal', key);
            card.innerHTML = 
                '<div class="don-icon"><i class="' + item.icon + '"></i></div>' +
                '<h3>' + item.title + '</h3>' +
                '<div class="don-click-hint"><i class="fas fa-table"></i> Click to view records</div>';
            container.appendChild(card);
        });

        container.querySelectorAll('.don-card').forEach(function(card, index) {
            card.style.transitionDelay = (index * 0.1) + 's';
        });

        container.querySelectorAll('.don-card-clickable').forEach(function(card) {
            card.addEventListener('click', function() {
                var key = this.getAttribute('data-donation-modal');
                var modal = document.getElementById('modal-donation-' + key);
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    renderDonationTable(key);
                }
            });
        });
    }

    function renderDonationTable(key) {
        if (typeof DONATIONS_SHEETS === 'undefined' || !DONATIONS_SHEETS[key]) return;
        var config = DONATIONS_SHEETS[key];
        
        var table = document.getElementById('donationTable' + key.charAt(0).toUpperCase() + key.slice(1));
        var empty = document.getElementById('donationEmpty' + key.charAt(0).toUpperCase() + key.slice(1));
        var statsBar = document.getElementById('donationStats' + key.charAt(0).toUpperCase() + key.slice(1));
        
        if (!table) return;

        // Show loading
        table.style.display = 'none';
        if (empty) { empty.style.display = 'block'; empty.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Loading data from Google Sheets...</p>'; }

        fetchSheetData(key).then(function(data) {
            if (!data || data.rows.length === 0) {
                table.style.display = 'none';
                if (empty) { empty.style.display = 'block'; empty.innerHTML = '<i class="fas fa-folder-open"></i><p>No records found. Add data to the Google Sheet.</p>'; }
                return;
            }

            // Stats bar
            if (statsBar) {
                statsBar.innerHTML = '<div class="don-modal-stat"><span class="don-modal-number">' + data.rows.length + '</span><span class="don-modal-label">Total Records</span></div>';
            }

            table.style.display = 'table';
            if (empty) empty.style.display = 'none';

            // Headers
            var thead = table.querySelector('thead');
            thead.innerHTML = '<tr><th>#</th>' + data.headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';

            // Rows
            var tbody = table.querySelector('tbody');
            tbody.innerHTML = '';
            data.rows.forEach(function(row, i) {
                var tr = '<tr><td class="row-num">' + (i + 1) + '</td>';
                data.headers.forEach(function(h) {
                    var val = row[h] || '';
                    if (h.toLowerCase().includes('date') && val) {
                        try { val = new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch(e) {}
                    }
                    tr += '<td>' + val + '</td>';
                });
                tr += '</tr>';
                tbody.innerHTML += tr;
            });
        });
    }
    renderDonationCards();

    document.querySelectorAll('.celeb-card, .don-card, .bio-section, .value-card, .fact-item, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add stagger delay to grid items
    document.querySelectorAll('.celebrations-grid .celeb-card').forEach((card, index) => {
        card.style.transitionDelay = (index * 0.1) + 's';
    });

    document.querySelectorAll('.values-grid .value-card').forEach((card, index) => {
        card.style.transitionDelay = (index * 0.1) + 's';
    });

    document.querySelectorAll('.mahesh-facts .fact-item').forEach((item, index) => {
        item.style.transitionDelay = (index * 0.08) + 's';
    });

    document.querySelectorAll('.contact-grid .contact-item').forEach((item, index) => {
        item.style.transitionDelay = (index * 0.1) + 's';
    });

    // Modal functionality
    const celebCards = document.querySelectorAll('.celeb-card[data-modal]');
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.modal-close');

    celebCards.forEach(card => {
        card.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal-overlay').classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Touch swipe down to close modal
        let modalTouchStartY = 0;
        modal.addEventListener('touchstart', function(e) {
            modalTouchStartY = e.touches[0].clientY;
        }, { passive: true });
        modal.addEventListener('touchend', function(e) {
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndY - modalTouchStartY > 100) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, { passive: true });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });

    // ============================================
    // CLOUDINARY GALLERY SYSTEM (Auto-Sync from API)
    // ============================================
    
    const CLOUD_NAME = 'tzlcekor';
    const API_BASE = window.location.origin + '/api/gallery';
    
    let galleryCache = null;

    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
    }

    let lightboxOverlay = null;
    let lightboxImg = null;

    function createLightbox() {
        if (lightboxOverlay) return;
        lightboxOverlay = document.createElement('div');
        lightboxOverlay.className = 'lightbox-overlay';
        lightboxOverlay.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <div class="lightbox-content">
                <img src="" alt="">
                <div class="lightbox-actions">
                    <button class="lightbox-btn lightbox-download">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(lightboxOverlay);
        lightboxImg = lightboxOverlay.querySelector('img');
        lightboxOverlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', function(e) {
            if (e.target === this) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) closeLightbox();
        });

        // Touch swipe down to close lightbox on mobile
        let touchStartY = 0;
        lightboxOverlay.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        lightboxOverlay.addEventListener('touchend', function(e) {
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndY - touchStartY > 80) closeLightbox();
        }, { passive: true });
    }

    function openLightbox(imgUrl, downloadUrl, filename) {
        createLightbox();
        lightboxImg.src = imgUrl;
        lightboxOverlay.querySelector('.lightbox-download').onclick = function() {
            downloadFile(downloadUrl, filename);
        };
        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (lightboxOverlay) {
            lightboxOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function createImageItem(photo) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const fileName = photo.name + '.jpg';
        const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_300,c_fill/${photo.id}`;
        const fullImgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${photo.id}`;
        
        item.innerHTML = `
            <img src="${imgUrl}" alt="" loading="lazy">
            <div class="gallery-overlay">
                <button class="gallery-btn view-btn" title="View Full Size">
                    <i class="fas fa-expand"></i>
                </button>
                <button class="gallery-btn download-btn" title="Download">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        item.querySelector('.view-btn').addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(fullImgUrl, fullImgUrl, fileName);
        });
        item.querySelector('.download-btn').addEventListener('click', function(e) {
            e.preventDefault();
            downloadFile(fullImgUrl, fileName);
        });
        return item;
    }

    function createVideoItem(video) {
        const item = document.createElement('div');
        item.className = 'gallery-item video-item';
        const fileName = video.name + '.mp4';
        const thumbUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_400,h_300,c_fill/${video.id}.jpg`;
        const videoUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${video.id}`;
        
        item.innerHTML = `
            <img src="${thumbUrl}" alt="" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/1a1a1a/d4a843?text=Video'">
            <div class="play-icon"><i class="fas fa-play"></i></div>
            <div class="gallery-overlay">
                <button class="gallery-btn view-btn" title="Play Video">
                    <i class="fas fa-play"></i>
                </button>
                <button class="gallery-btn download-btn" title="Download">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        item.querySelector('.view-btn').addEventListener('click', function(e) {
            e.preventDefault();
            window.open(videoUrl, '_blank');
        });
        item.querySelector('.download-btn').addEventListener('click', function(e) {
            e.preventDefault();
            downloadFile(videoUrl, fileName);
        });
        return item;
    }

    async function fetchGallery() {
        if (galleryCache) return galleryCache;
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error('API error');
            galleryCache = await res.json();
            return galleryCache;
        } catch (e) {
            // Fallback to static media-config.js if API unavailable
            return null;
        }
    }

    async function loadGallery(modalId, folderKey) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        const galleryContainer = modal.querySelector('.cloudinary-gallery');
        if (!galleryContainer) return;
        const photosGrid = galleryContainer.querySelector('.photos-grid');
        const videosGrid = galleryContainer.querySelector('.videos-grid');
        const photosLoading = galleryContainer.querySelector('.photos-loading');
        const videosLoading = galleryContainer.querySelector('.videos-loading');

        if (photosLoading) photosLoading.style.display = 'none';
        if (videosLoading) videosLoading.style.display = 'none';

        const apiData = await fetchGallery();
        let photos = [];
        let videos = [];

        if (apiData && apiData[folderKey]) {
            photos = apiData[folderKey].photos || [];
            videos = apiData[folderKey].videos || [];
        }

        if (photos.length === 0) {
            photosGrid.innerHTML = '<div class="gallery-empty"><i class="fas fa-images"></i><p>No photos yet</p></div>';
        } else {
            photos.forEach(p => photosGrid.appendChild(createImageItem(p)));
        }

        if (videos.length === 0) {
            videosGrid.innerHTML = '<div class="gallery-empty"><i class="fas fa-video"></i><p>No videos yet</p></div>';
        } else {
            videos.forEach(v => videosGrid.appendChild(createVideoItem(v)));
        }
    }

    function initCloudinaryGalleries() {
        const modalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const modal = mutation.target;
                    if (modal.classList.contains('active')) {
                        const folderKey = modal.dataset.folder;
                        if (folderKey && !modal.dataset.loaded) {
                            modal.dataset.loaded = 'true';
                            loadGallery(modal.id, folderKey);
                        }
                    }
                }
            });
        });

        document.querySelectorAll('.modal-overlay[data-folder]').forEach(modal => {
            modalObserver.observe(modal, { attributes: true });
        });
    }

    initCloudinaryGalleries();
});
