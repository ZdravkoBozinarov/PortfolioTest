/* app.js */
(() => {
    'use strict';

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
            const typingSpeed = 100;
            const pauseTime = 1500;

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
        (() => {
            const DESKTOP_BP = 900;

            const toggle = document.querySelector('.nav-toggle');
            const drawer = document.getElementById('primary-nav');
            const overlay = document.querySelector('.nav-overlay');
            const closeBtn = drawer ? drawer.querySelector('.drawer-close') : null;

            if (!toggle || !drawer || !overlay) return;

            const focusableSel =
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
            const getFocusable = () => Array.from(drawer.querySelectorAll(focusableSel));
            const isOpen = () => drawer.classList.contains('is-open');

            function openMenu() {
                toggle.setAttribute('aria-expanded', 'true');
                toggle.setAttribute('aria-label', 'Close menu');
                drawer.classList.add('is-open');
                overlay.hidden = false;
                overlay.classList.add('is-visible');
                document.body.style.overflow = 'hidden';

                const first = getFocusable()[0] || closeBtn || toggle;
                first && first.focus();

                document.addEventListener('keydown', onKeydown, true);
            }

            function closeMenu() {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open menu');
                drawer.classList.remove('is-open');
                overlay.classList.remove('is-visible');
                overlay.hidden = true;
                document.body.style.overflow = '';
                toggle.focus();

                document.removeEventListener('keydown', onKeydown, true);
            }

            function onKeydown(e) {
                if (!isOpen()) return;
                if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }

                if (e.key === 'Tab') {
                    const f = getFocusable();
                    if (!f.length) return;
                    const first = f[0], last = f[f.length - 1];

                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault(); last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault(); first.focus();
                    }
                }
            }
            toggle.type = 'button';
            toggle.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()));
            overlay.addEventListener('click', closeMenu);
            if (closeBtn) closeBtn.addEventListener('click', closeMenu);

            drawer.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (!link) return;

                const targetSel = link.getAttribute('data-scroll');
                const target = targetSel ? document.querySelector(targetSel) : null;

                e.preventDefault();
                closeMenu();

                setTimeout(() => {
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        const href = link.getAttribute('href');
                        if (href && href !== '#') window.location.href = href;
                    }
                }, 50);
            });

            const mq = window.matchMedia(`(min-width: ${DESKTOP_BP}px)`);
            mq.addEventListener('change', (e) => {
                if (e.matches) {
                    drawer.classList.remove('is-open');
                    overlay.classList.remove('is-visible');
                    overlay.hidden = true;
                    document.body.style.overflow = '';
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-label', 'Open menu');
                    document.removeEventListener('keydown', onKeydown, true);
                }
            });
        })();


        /* ===============================
         * 4) Intersection animations
         * =============================== */
        (function initIntersectionAnimations() {
            if (!('IntersectionObserver' in window)) return;

            const sections = document.querySelectorAll('.top ,.experience-section, .my-profiles, .my-tech-stack');
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

        const scrollBtn = document.getElementById('scrollToTop');
        if (scrollBtn) {
            const onScroll = () => {
                const shouldShow = window.scrollY > 250; // tweak threshold if needed
                scrollBtn.classList.toggle('show', shouldShow);
            };

            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll(); // set initial state

            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }


    });
})();
