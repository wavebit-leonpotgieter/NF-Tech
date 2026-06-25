document.addEventListener('DOMContentLoaded', () => {
    // --- Global UI Elements ---

    // Auto-update footer year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Header scroll background effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile navigation toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navLinks.classList.toggle('active');

            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu on regular link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('dropdown-trigger') && window.innerWidth <= 1023) {
                    return; // Let the dropdown logic handle it
                }
                menuToggle.classList.remove('open');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Mobile Dropdown Accordion
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownParent = document.querySelector('.nav-item-dropdown');

    if (dropdownTrigger && dropdownParent) {
        dropdownTrigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 1023) {
                e.preventDefault();
                dropdownParent.classList.toggle('open-mobile');
            }
        });
    }

    // --- Micro Scroll Animations ---
    const reveals = document.querySelectorAll('.reveal');

    if (reveals.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        reveals.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // --- Services Page: Scroll Spy & Dynamic URL Engine ---
    const sections = document.querySelectorAll('.division-block');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (sections.length > 0 && sidebarLinks.length > 0) {
        
        // Updates the query string adhering strictly to MVC routing patterns: /home/services?id=targetId
        function safeUpdateURL(targetId) {
            if (!targetId) return;
            try {
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.get('id') !== targetId) {
                    searchParams.set('id', targetId);
                    const newPath = window.location.pathname + '?' + searchParams.toString();
                    history.replaceState(null, '', newPath);
                }
            } catch (e) {
                console.warn("Could not write History parameters:", e);
            }
        }

        // On Load path detection and smooth scroll
        const initialTargetEl = document.getElementById('initial-target');
        let initialTargetId = initialTargetEl ? initialTargetEl.getAttribute('data-target') : '';
        
        // Fallback: Check Query Params if attribute empty
        if (!initialTargetId) {
            const urlParams = new URLSearchParams(window.location.search);
            initialTargetId = urlParams.get('id');
        }

        if (initialTargetId) {
            const targetSection = document.getElementById(initialTargetId);
            if (targetSection) {
                setTimeout(() => {
                    const offset = window.innerWidth <= 1024 ? 160 : 240;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetSection.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        }

        // Scroll spy to update active division tab and append path dynamic slugs
        window.addEventListener('scroll', () => {
            let currentActiveId = '';

            sections.forEach(sec => {
                const secTop = sec.getBoundingClientRect().top + window.scrollY;
                const offset = window.innerWidth <= 1024 ? 200 : 260;

                if (window.scrollY >= secTop - offset) {
                    currentActiveId = sec.getAttribute('id');
                }
            });

            if (currentActiveId) {
                sidebarLinks.forEach(link => {
                    if (link.getAttribute('data-target') === currentActiveId) {
                        if (!link.classList.contains('active')) {
                            sidebarLinks.forEach(l => l.classList.remove('active'));
                            link.classList.add('active');

                            // Center active item in horizontal scrollbar capsule on mobile
                            const container = document.querySelector('.explorer-nav-capsule');
                            if (container) {
                                const linkOffsetLeft = link.offsetLeft;
                                const linkWidth = link.offsetWidth;
                                const containerWidth = container.offsetWidth;
                                
                                container.scrollTo({
                                    left: linkOffsetLeft - (containerWidth / 2) + (linkWidth / 2),
                                    behavior: 'smooth'
                                });
                            }

                            safeUpdateURL(currentActiveId);
                        }
                    }
                });
            }
        });

        // Click handler to dynamically smooth scroll instead of page reload
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const offset = window.innerWidth <= 1024 ? 160 : 240;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetSection.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    safeUpdateURL(targetId);
                }
            });
        });
    }
});