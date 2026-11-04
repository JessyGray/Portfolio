(function () {
    'use strict';

    const $$ = (selector) => Array.from(document.querySelectorAll(selector));
    const site = window.site || {};
    const counters = $$('[data-count]');
    const counterTweens = [];
    const finishCounters = () => {
        counterTweens.forEach((tween) => tween.kill());
        counters.forEach((element) => { element.textContent = element.dataset.count; });
    };
    window.addEventListener('beforeprint', finishCounters);

    if (typeof window.gsap === 'undefined' || site.reduceMotion) {
        document.documentElement.classList.remove('motion');
        $$('.langs').forEach((element) => element.classList.add('is-in'));
        finishCounters();
        return;
    }

    const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    gsap.registerPlugin(...[window.ScrollTrigger, window.Flip].filter(Boolean));

    const heroLines = $$('[data-hero-line]');
    const heroDetails = $$('[data-hero]');
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (heroLines.length) heroTimeline.fromTo(heroLines,
        { yPercent: 108, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.1, clearProps: 'transform,opacity,visibility' });
    if (heroDetails.length) heroTimeline.fromTo(heroDetails,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.075, clearProps: 'transform,opacity,visibility' }, 0.2);

    if (!hasScrollTrigger) {
        document.documentElement.classList.remove('motion');
        finishCounters();
        return;
    }
    site.lenis?.on('scroll', ScrollTrigger.update);

    const reveal = (elements, distance) => {
        elements.forEach((element) => {
            ScrollTrigger.create({
                trigger: element,
                start: 'top 94%',
                once: true,
                onEnter: () => gsap.fromTo(element,
                    { y: distance, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' })
            });
        });
    };
    reveal($$('[data-reveal]'), 28);
    reveal($$('[data-split]'), 18);
    reveal($$('.card').filter((card) => card.style.display !== 'none'), 34);

    counters.forEach((element) => {
        const end = Number(element.dataset.count);
        if (!Number.isFinite(end)) return;
        ScrollTrigger.create({
            trigger: element,
            start: 'top 95%',
            once: true,
            onEnter: () => {
                if (end > 100) return;
                const value = { current: 0 };
                counterTweens.push(gsap.to(value, {
                    current: end,
                    duration: 1.25,
                    ease: 'power2.out',
                    onUpdate: () => { element.textContent = Math.round(value.current); },
                    onComplete: () => { element.textContent = element.dataset.count; }
                }));
            }
        });
    });

    const timelineProgress = document.querySelector('.timeline__progress');
    if (timelineProgress) {
        gsap.fromTo(timelineProgress, { scaleY: 0 }, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: 0.5 }
        });
    }

    $$('.langs').forEach((element) => ScrollTrigger.create({
        trigger: element,
        start: 'top 95%',
        once: true,
        onEnter: () => element.classList.add('is-in')
    }));

    window.addEventListener('beforeprint', () => {
        heroTimeline.progress(1);
        gsap.killTweensOf('[data-reveal], [data-split], .card');
        gsap.set('[data-reveal], [data-split], .card', { clearProps: 'transform,opacity,visibility' });
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
