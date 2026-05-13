document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Loader Logic
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                initRevealAnimations(); // Start reveal animations after loader is gone
            }, 500);
        }, 2000);
    });

    // 2. Custom Cursor
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Lerp effect for the follower
    const render = () => {
        posX += (mouseX - posX) * 0.1;
        posY += (mouseY - posY) * 0.1;
        
        follower.style.left = `${posX - 16}px`;
        follower.style.top = `${posY - 16}px`;
        
        requestAnimationFrame(render);
    };
    render();

    // Cursor interactions
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .filter-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.transform = 'scale(1.5)';
            follower.style.background = 'rgba(212, 175, 55, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.transform = 'scale(1)';
            follower.style.background = 'transparent';
        });
    });

    // 3. Navigation Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 4. Reveal on Scroll (Intersection Observer)
    const initRevealAnimations = () => {
        const reveals = document.querySelectorAll('.reveal-text, .reveal, .project-card, .skill-card, .timeline-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // If it's a skill progress bar, trigger the width animation
                    if (entry.target.classList.contains('skill-card')) {
                        const bar = entry.target.querySelector('.skill-progress');
                        if (bar) bar.style.width = bar.dataset.width || bar.style.width;
                    }
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(el => {
            observer.observe(el);
            // Add initial state class for CSS transitions
            el.classList.add('reveal-init');
        });
    };

    // 5. Project Filtering and "Show All" Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const showAllBtn = document.getElementById('show-all-projects');
    const projectsFooter = document.querySelector('.projects-footer');
    
    let isShowingAll = false;

    const updateProjectVisibility = (filterValue = 'all', instant = false) => {
        let visibleCount = 0;
        let totalMatching = 0;

        // First pass: Count total matching
        projectCards.forEach(card => {
            const matchesFilter = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
            if (matchesFilter) totalMatching++;
        });

        // Second pass: Update styles
        projectCards.forEach((card) => {
            const matchesFilter = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
            const shouldShow = matchesFilter && (isShowingAll || visibleCount < 3);
            
            if (shouldShow) {
                card.style.display = 'block';
                if (instant) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    card.classList.add('active'); // Sync with intersection observer state
                } else {
                    // Smooth entry for "Afficher tout"
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                }
                visibleCount++;
            } else {
                // Hide
                if (instant || !matchesFilter) {
                    // Instant hide for filter changes or if explicitly requested
                    card.style.display = 'none';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                } else {
                    // Smooth fade out for "Masquer" button
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 400);
                }
            }
        });

        // Show/hide "Show All" button container
        if (totalMatching > 3) {
            projectsFooter.style.display = 'flex';
        } else {
            projectsFooter.style.display = 'none';
        }
    };

    // Initial call
    updateProjectVisibility('all', true);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            isShowingAll = false; // Reset "Show All" state when filtering
            updateProjectVisibility(btn.getAttribute('data-filter'), true);
            if (showAllBtn) showAllBtn.innerText = 'Afficher tous les projets';
        });
    });

    // 5. Project Modal Logic
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    const expandBtns = document.querySelectorAll('.expand-project');

    const openModal = (card) => {
        const title = card.querySelector('h3').innerText;
        const category = card.querySelector('.category-subtitle').innerText;
        const description = card.querySelector('p').innerText;
        const software = card.querySelector('.software').innerText;
        const detailsExtra = card.querySelector('.project-details').innerHTML;
        const youtubeLink = card.querySelector('.view-project').getAttribute('href');
        
        // Get video source from iframe
        const originalIframe = card.querySelector('iframe');
        const videoSrc = originalIframe ? originalIframe.getAttribute('src') : '';

        // Inject content into modal
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-category').innerText = category;
        
        // Fix: Use the actual details content without duplicating the first paragraph
        const detailsContainer = card.querySelector('.project-details');
        document.getElementById('modal-description').innerHTML = ''; // Clear description field as we move everything to details-extra
        document.getElementById('modal-details-extra').innerHTML = detailsContainer.innerHTML;
        
        document.getElementById('modal-software').innerText = software;
        document.getElementById('modal-link').setAttribute('href', youtubeLink);

        if (videoSrc) {
            document.getElementById('modal-media').innerHTML = `<iframe src="${videoSrc}?autoplay=1" allow="autoplay; fullscreen"></iframe>`;
        } else {
            // Placeholder if no video
            const placeholder = card.querySelector('.media-placeholder');
            document.getElementById('modal-media').innerHTML = placeholder ? placeholder.outerHTML : '';
        }

        // Show modal
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        // Stop video by clearing content
        document.getElementById('modal-media').innerHTML = '';
    };

    expandBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.project-card');
            openModal(card);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
            isShowingAll = !isShowingAll; // Toggle state
            
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            updateProjectVisibility(activeFilter);

            // Update button text
            if (isShowingAll) {
                showAllBtn.innerText = 'Masquer les projets';
            } else {
                showAllBtn.innerText = 'Afficher tous les projets';
                
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    window.scrollTo({
                        top: projectsSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    // 6. Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 7. Form Submission Placeholder
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Envoi en cours...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerText = 'Message envoyé !';
                btn.style.background = '#28a745';
                btn.style.borderColor = '#28a745';
                btn.style.color = '#fff';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = 'transparent';
                    btn.style.borderColor = 'var(--accent-color)';
                    btn.style.color = 'var(--accent-color)';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

});
