(function () {
    'use strict';

    const root = document.documentElement;
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
    const hasGsap = typeof window.gsap !== 'undefined';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const site = (window.site = { reduceMotion, lenis: null, ready: Promise.resolve() });

    root.classList.remove('intro');
    if (!hasGsap || reduceMotion) root.classList.remove('motion');
    $('.preloader')?.remove();
    $('.cursor')?.remove();

    const themeBtn = $('[data-theme-toggle]');
    const themeMeta = $('meta[name="theme-color"]');

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#171b19' : '#f5f3ee');
        if (themeBtn) themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }

    applyTheme(root.getAttribute('data-theme') || 'light');
    themeBtn?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch (error) { /* Storage can be disabled. */ }
    });

    if (typeof window.Lenis !== 'undefined' && !reduceMotion) {
        const lenis = new Lenis({ duration: 0.8, smoothWheel: true });
        site.lenis = lenis;
        if (hasGsap) {
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const frame = (time) => {
                lenis.raf(time);
                requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        }
    }

    const header = $('.site-header');
    const progress = $('.scroll-progress span');
    let scrollScheduled = false;

    function updateScroll() {
        const max = root.scrollHeight - window.innerHeight;
        header?.classList.toggle('is-scrolled', window.scrollY > 16);
        if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        scrollScheduled = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollScheduled) {
            requestAnimationFrame(updateScroll);
            scrollScheduled = true;
        }
    }, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    updateScroll();

    const menuBtn = $('.menu-btn');
    const menu = $('#mobile-menu');
    const background = $$('main, body > footer');
    const inertState = new Map();
    let menuAnimation = null;

    function closeMenu(restoreFocus = true) {
        if (!menu || menu.hidden) return;
        menuAnimation?.kill();
        menu.hidden = true;
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('menu-open');
        background.forEach((element) => { element.inert = inertState.get(element) || false; });
        inertState.clear();
        site.lenis?.start();
        if (restoreFocus) menuBtn.focus({ preventScroll: true });
    }

    function openMenu() {
        if (!menu || !menuBtn) return;
        menu.hidden = false;
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('menu-open');
        background.forEach((element) => {
            inertState.set(element, element.inert);
            element.inert = true;
        });
        site.lenis?.stop();
        if (hasGsap && !reduceMotion) {
            menuAnimation?.kill();
            menuAnimation = gsap.fromTo($$('a', menu),
                { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' });
        }
        $('a', menu)?.focus({ preventScroll: true });
    }

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu());
        $$('a', menu).forEach((link) => link.addEventListener('click', () => closeMenu(false)));
        document.addEventListener('keydown', (event) => {
            if (menu.hidden) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu();
                return;
            }
            if (event.key !== 'Tab') return;
            const controls = [menuBtn, ...$$('a[href], button:not([disabled])', menu)];
            const current = controls.indexOf(document.activeElement);
            const next = (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
            event.preventDefault();
            controls[next].focus();
        });
        window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
            if (event.matches) closeMenu(false);
        });
    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        const hash = link.getAttribute('href');
        if (hash === '#') return;
        let target;
        try { target = $(hash); } catch (error) { return; }
        if (!target) return;
        event.preventDefault();
        closeMenu(false);
        const offset = -(parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 80);
        if (site.lenis) site.lenis.scrollTo(target, { offset });
        else window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY + offset,
            behavior: reduceMotion ? 'instant' : 'smooth'
        });
        history.replaceState(null, '', hash);
        const needsTabIndex = !target.hasAttribute('tabindex');
        if (needsTabIndex) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (needsTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });

    const navLinks = $$('.nav__link[href^="#"]');
    if (navLinks.length && 'IntersectionObserver' in window) {
        const sections = new Map();
        navLinks.forEach((link) => {
            const section = $(link.getAttribute('href'));
            if (section) sections.set(section, link);
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    link.classList.remove('is-active');
                    link.removeAttribute('aria-current');
                });
                const current = sections.get(entry.target);
                current.classList.add('is-active');
                current.setAttribute('aria-current', 'location');
            });
        }, { rootMargin: '-25% 0px -60% 0px' });
        sections.forEach((link, section) => observer.observe(section));
    }

    $$('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });
    const toast = $('.toast');
    let toastTimer;
    site.toast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    };

    $$('[data-copy]').forEach((button) => {
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(button.dataset.copy);
                site.toast('Email copied');
            } catch (error) {
                site.toast('Copy unavailable. Select the email address to copy it.');
            }
        });
    });
    $$('[data-print]').forEach((button) => button.addEventListener('click', () => window.print()));
})();
