/* app.js */
(() => {
    'use strict';

    // Run after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        /* ===============================
         * 1) Typing effect
         * =============================== */
        const typingEl = document.getElementById('typing');
        if (typingEl) {
            const words = ['software engineer', 'problem solver', 'tech enthusiasts'];
            let wordIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            const typingSpeed = 100;   // ms per character
            const pauseTime = 1500;    // pause when word is fully typed

            const typeEffect = () => {
                const currentWord = words[wordIndex] || '';
                if (isDeleting) {
                    typingEl.textContent = currentWord.substring(0, charIndex--);
                    if (charIndex < 0) {
                        isDeleting = false;
                        wordIndex = (wordIndex + 1) % words.length;
                    }
                } else {
                    typingEl.textContent = currentWord.substring(0, charIndex++);
                    if (charIndex > currentWord.length) {
                        isDeleting = true;
                        setTimeout(typeEffect, pauseTime);
                        return;
                    }
                }
                setTimeout(typeEffect, isDeleting ? typingSpeed / 2 : typingSpeed);
            };

            typeEffect();
        }

        /* ===============================
         * 2) Smooth in-page scroll
         * =============================== */
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[data-scroll]');
            if (!a) return;

            const selector = a.dataset.scroll;
            if (!selector) return;

            const target = document.querySelector(selector);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        /* ===============================
         * 3) Nav drawer toggle
         * =============================== */
        (function initNavDrawer() {
            const toggle = document.querySelector('.nav-toggle');
            const drawer = document.getElementById('primary-nav');
            const overlay = document.querySelector('.nav-overlay');
            const closeBtn = drawer ? drawer.querySelector('.drawer-close') : null;

            if (!toggle || !drawer || !overlay || !closeBtn) return;

            function openMenu() {
                toggle.setAttribute('aria-expanded', 'true');
                drawer.classList.add('is-open');
                overlay.hidden = false;
                overlay.classList.add('is-visible');
                document.body.style.overflow = 'hidden';
                (drawer.querySelector('a') || closeBtn).focus();
            }

            function closeMenu() {
                toggle.setAttribute('aria-expanded', 'false');
                drawer.classList.remove('is-open');
                overlay.classList.remove('is-visible');
                overlay.hidden = true;
                document.body.style.overflow = '';
                toggle.focus();
            }

            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                expanded ? closeMenu() : openMenu();
            });

            overlay.addEventListener('click', closeMenu);
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
            closeBtn.addEventListener('click', closeMenu);
            drawer.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
        })();

        /* ===============================
         * 4) Intersection animations
         * =============================== */
        (function initIntersectionAnimations() {
            if (!('IntersectionObserver' in window)) return;

            const sections = document.querySelectorAll('.experience-section, .my-profiles, .my-tech-stack');
            if (!sections.length) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('animate');
                });
            }, { threshold: 0.3 });

            sections.forEach((el) => observer.observe(el));
        })();

        /* ===============================
        * 5) Download CV with confirm
        * =============================== */
        const cvLink = document.querySelector('[data-download="cv"]');
        if (cvLink) {
            cvLink.addEventListener('click', (e) => {
                e.preventDefault();

                const url = cvLink.getAttribute('href') || './assets/CV.pdf';
                const filename = cvLink.getAttribute('download') || 'CV.pdf';

                const ok = window.confirm('Appreciate your interest for downloading my CV! \nAre you sure that you want to download it?');
                if (!ok) return;

                const a = document.createElement('a');
                a.href = url;
                a.setAttribute('download', filename);
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
        }

    });
})();
