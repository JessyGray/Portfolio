(function () {
    'use strict';

    const root = document.documentElement;
    const hasGsap = typeof window.gsap !== 'undefined';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasGsap) root.classList.remove('motion');

    const site = (window.site = { reduceMotion, lenis: null });

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* theme */

    const themeBtn = $('[data-theme-toggle]');
    const themeMeta = $('meta[name="theme-color"]');

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0c0c0d' : '#f3f1ec');
    }

    applyTheme(root.getAttribute('data-theme') || 'dark');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
        });
    }

    /* smooth scroll */

    if (typeof window.Lenis !== 'undefined' && !reduceMotion) {
        const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        site.lenis = lenis;

        if (hasGsap) {
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
    }

    function scrollToTarget(target) {
        const offset = -(parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 72);
        if (site.lenis) {
            site.lenis.scrollTo(target, { offset });
        } else {
            const top = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = id === '#main' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        closeMenu();
        scrollToTarget(target);
        if (target !== 0) history.replaceState(null, '', id);
    });

    /* header */

    const header = $('.site-header');
    const progress = $('.scroll-progress span');
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('is-scrolled', y > 10);
        header.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
        if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        lastY = y;
        ticking = false;
    }

    if (header) {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });
        onScroll();
    }

    /* mobile menu */

    const menuBtn = $('.menu-btn');
    const menu = $('#mobile-menu');

    function openMenu() {
        menu.hidden = false;
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('menu-open');
        if (site.lenis) site.lenis.stop();

        if (hasGsap && !reduceMotion) {
            gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.out' });
            gsap.from($$('li', menu), { yPercent: 60, opacity: 0, duration: 0.6, stagger: 0.05, delay: 0.15, ease: 'expo.out' });
        }
    }

    function closeMenu() {
        if (!menu || menu.hidden) return;
        menu.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('menu-open');
        if (site.lenis) site.lenis.start();
    }

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
        $$('a', menu).forEach((a) => a.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.hidden) {
                closeMenu();
                menuBtn.focus();
            }
        });
        window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && closeMenu());
    }

    /* active section in nav */

    const navLinks = $$('.nav__link[href^="#"]');
    if (navLinks.length && 'IntersectionObserver' in window) {
        const map = new Map();
        navLinks.forEach((link) => {
            const section = $(link.getAttribute('href'));
            if (section) map.set(section, link);
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((l) => l.classList.remove('is-active'));
                map.get(entry.target).classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        map.forEach((_, section) => io.observe(section));
    }

    /* misc */

    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

    const toast = $('.toast');
    let toastTimer;
    site.toast = function (msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
    };

    $$('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
                site.toast('Copied');
            } catch (e) {
                window.location.href = `mailto:${text}`;
            }
        });
    });

    $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

    /* cursor */

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cursor = $('.cursor');

    if (cursor && finePointer && !reduceMotion) {
        const label = $('.cursor__label', cursor);
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mouse = { x: pos.x, y: pos.y };

        window.addEventListener('pointermove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            cursor.classList.add('is-visible');
        }, { passive: true });

        document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

        (function loop() {
            pos.x += (mouse.x - pos.x) * 0.18;
            pos.y += (mouse.y - pos.y) * 0.18;
            cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
            requestAnimationFrame(loop);
        })();

        document.addEventListener('pointerover', (e) => {
            const labelled = e.target.closest('[data-cursor]');
            const interactive = e.target.closest('a, button, input, label');

            if (labelled) {
                label.textContent = labelled.dataset.cursor;
                cursor.classList.add('has-label');
                cursor.classList.remove('is-hover');
            } else {
                cursor.classList.remove('has-label');
                cursor.classList.toggle('is-hover', !!interactive);
            }
        });
    } else if (cursor) {
        cursor.remove();
    }

    /* magnetic buttons */

    if (finePointer && !reduceMotion && hasGsap) {
        $$('[data-magnetic]').forEach((el) => {
            const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
            const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });

            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.3);
                yTo((e.clientY - r.top - r.height / 2) * 0.4);
            });
            el.addEventListener('pointerleave', () => {
                xTo(0);
                yTo(0);
            });
        });
    }

    /* preloader, once per session */

    site.ready = new Promise((resolve) => {
        const loader = $('.preloader');

        if (!loader || !hasGsap || !root.classList.contains('intro')) {
            root.classList.remove('intro');
            if (loader) loader.remove();
            resolve();
            return;
        }

        if (site.lenis) site.lenis.stop();

        const counter = $('[data-preloader-count]', loader);
        const state = { v: 0 };

        const finish = () => {
            loader.remove();
            root.classList.remove('intro');
            try { sessionStorage.setItem('intro-seen', '1'); } catch (e) { /* ignore */ }
            if (site.lenis) site.lenis.start();
        };

        gsap.timeline({ onComplete: finish })
            .to(state, {
                v: 100,
                duration: 1.4,
                ease: 'power2.inOut',
                onUpdate: () => (counter.textContent = Math.round(state.v))
            })
            .to($('.preloader__bar span', loader), { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
            .to(loader, {
                clipPath: 'inset(0 0 100% 0)',
                duration: 0.9,
                ease: 'expo.inOut',
                onStart: resolve
            }, '+=0.15');
    });
})();
