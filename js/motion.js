(function () {
    'use strict';

    if (typeof window.gsap === 'undefined') return;

    const site = window.site || {};
    const hasST = typeof window.ScrollTrigger !== 'undefined';
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    gsap.registerPlugin(...[window.ScrollTrigger, window.Flip].filter(Boolean));

    if (site.reduceMotion || !hasST) {
        gsap.set('[data-hero], [data-hero-line]', { autoAlpha: 1 });
        $$('.langs').forEach((el) => el.classList.add('is-in'));
        return;
    }

    if (site.lenis) site.lenis.on('scroll', ScrollTrigger.update);

    function splitWords(el) {
        const walk = (node) => {
            Array.from(node.childNodes).forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) {
                            frag.appendChild(document.createTextNode(' '));
                            return;
                        }
                        const outer = document.createElement('span');
                        const inner = document.createElement('span');
                        outer.className = 'word';
                        inner.textContent = part;
                        outer.appendChild(inner);
                        frag.appendChild(outer);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    walk(child);
                }
            });
        };
        walk(el);
        return $$('.word > span', el);
    }

    /* intro */

    const heroLines = $$('[data-hero-line]');
    const heroBits = $$('[data-hero]');

    gsap.set(heroLines, { yPercent: 115, autoAlpha: 1 });
    gsap.set(heroBits, { y: 24, autoAlpha: 0 });

    Promise.resolve(site.ready).then(() => {
        gsap.timeline({ defaults: { ease: 'expo.out' } })
            .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.12 })
            .to(heroBits, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08, clearProps: 'transform' }, 0.3);
    });

    const hero = document.querySelector('.hero');
    if (hero) {
        gsap.to('.hero__title', {
            yPercent: -25,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
    }

    /* headings */

    $$('[data-split]').forEach((el) => {
        gsap.from(splitWords(el), {
            yPercent: 110,
            duration: 1,
            stagger: 0.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    /* reveal on scroll */

    const reveal = (targets, distance) => {
        if (!targets.length) return;
        gsap.set(targets, { autoAlpha: 0, y: distance });
        ScrollTrigger.batch(targets, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'expo.out',
                overwrite: true
            })
        });
    };

    reveal($$('[data-reveal]'), 40);
    reveal($$('.card').filter((c) => c.style.display !== 'none'), 60);

    /* numbers */

    $$('[data-count]').forEach((el) => {
        const obj = { v: 0 };
        el.textContent = '0';
        gsap.to(obj, {
            v: Number(el.dataset.count),
            duration: 1.6,
            ease: 'power3.out',
            onUpdate: () => (el.textContent = Math.round(obj.v)),
            scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
    });

    /* timeline and language bars */

    const progress = document.querySelector('.timeline__progress');
    if (progress) {
        gsap.to(progress, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 }
        });
    }

    $$('.langs').forEach((el) => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => el.classList.add('is-in')
        });
    });

    /* marquee leans with scroll speed */

    const marquee = document.querySelector('.marquee');
    if (marquee) {
        const skewTo = gsap.quickTo(marquee, 'skewX', { duration: 0.5, ease: 'power3.out' });
        let resetTimer;
        ScrollTrigger.create({
            onUpdate: (self) => {
                skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / -250));
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => skewTo(0), 120);
            }
        });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
