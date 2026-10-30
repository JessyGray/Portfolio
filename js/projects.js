(function () {
    'use strict';

    const projects = typeof PROJECTS !== 'undefined' && Array.isArray(PROJECTS) ? PROJECTS : [];
    const site = window.site || {};
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const arrowIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[ch]);
    }

    function mediaHTML(p) {
        return p.cover
            ? `<div class="card__media"><img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async"><span class="card__arrow" aria-hidden="true">${arrowIcon}</span></div>`
            : `<div class="card__media card__media--empty">
                    <span class="card__placeholder">${esc(p.title)}</span>
                    <ul class="tags">${(p.tags || []).slice(0, 4).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
                    <span class="card__arrow" aria-hidden="true">${arrowIcon}</span>
               </div>`;
    }

    function cardHTML(p, linkMode) {
        const opener = linkMode
            ? `<a class="card__open" href="projects.html?project=${encodeURIComponent(p.id)}">${esc(p.title)}</a>`
            : `<button class="card__open" type="button">${esc(p.title)}</button>`;

        return `
            <article class="card" data-id="${esc(p.id)}" data-cursor="View">
                ${mediaHTML(p)}
                <div class="card__info">
                    <h3 class="card__title">${opener}</h3>
                    <span class="card__type">${esc(p.status || p.type || p.year)}</span>
                    <p class="card__summary">${esc(p.summary)}</p>
                </div>
            </article>`;
    }

    /* CV page */

    const featured = $('[data-featured]');
    if (featured) {
        const list = projects.filter((p) => p.featured).slice(0, 3);
        if (list.length) {
            featured.innerHTML = list.map((p) => cardHTML(p, true)).join('');
        } else {
            featured.closest('section').hidden = true;
        }
    }

    /* projects page */

    const grid = $('[data-projects-grid]');
    if (!grid) return;

    const filtersEl = $('[data-filters]');
    const searchEl = $('[data-search]');
    const emptyEl = $('[data-empty]');
    const countEl = $('[data-project-count]');
    const params = new URLSearchParams(location.search);

    const categories = ['All', ...new Set(projects.flatMap((p) => p.category || []))];
    const state = {
        filter: categories.includes(params.get('filter')) ? params.get('filter') : 'All',
        query: ''
    };

    grid.innerHTML = projects.map((p) => cardHTML(p, false)).join('');
    const cards = $$('.card', grid);

    filtersEl.innerHTML = categories.map((cat) => {
        const n = cat === 'All' ? projects.length : projects.filter((p) => (p.category || []).includes(cat)).length;
        return `<button type="button" class="filter" data-filter="${esc(cat)}" aria-pressed="${cat === state.filter}">
                    ${esc(cat)} <span class="filter__count">${n}</span>
                </button>`;
    }).join('');

    function matches(p) {
        if (state.filter !== 'All' && !(p.category || []).includes(state.filter)) return false;
        if (!state.query) return true;
        return [p.title, p.type, p.summary, p.description, ...(p.tags || [])]
            .join(' ')
            .toLowerCase()
            .includes(state.query);
    }

    function apply(animate) {
        const canFlip = animate && window.Flip && !site.reduceMotion;
        const flipState = canFlip ? Flip.getState(cards) : null;
        let visible = 0;

        cards.forEach((card) => {
            const show = matches(projects.find((p) => p.id === card.dataset.id));
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        emptyEl.hidden = visible > 0;
        if (countEl) countEl.textContent = visible;

        if (canFlip) {
            Flip.from(flipState, {
                duration: 0.5,
                ease: 'power2.inOut',
                absolute: true,
                scale: true,
                onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }),
                onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.3 }),
                onComplete: () => window.ScrollTrigger && ScrollTrigger.refresh()
            });
        } else if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
        }
    }

    function setFilter(value) {
        state.filter = value;
        $$('[data-filter]', filtersEl).forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === value));

        const url = new URL(location.href);
        if (value === 'All') url.searchParams.delete('filter');
        else url.searchParams.set('filter', value);
        history.replaceState(null, '', url);
    }

    filtersEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn || btn.dataset.filter === state.filter) return;
        setFilter(btn.dataset.filter);
        apply(true);
    });

    let searchTimer;
    searchEl.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.query = searchEl.value.trim().toLowerCase();
            apply(true);
        }, 180);
    });

    $('[data-reset]').addEventListener('click', () => {
        searchEl.value = '';
        state.query = '';
        setFilter('All');
        apply(true);
    });

    apply(false);

    /* details */

    const modal = $('[data-modal]');
    if (!modal) return;
    let lastTrigger = null;

    function linkButton(href, text, primary) {
        const external = /^https?:\/\//.test(href);
        return `<a href="${esc(href)}" class="btn btn--small ${primary ? 'btn--accent' : 'btn--ghost'}"
                    ${external ? 'target="_blank" rel="noopener"' : ''}>
                    <span>${text}</span>${arrowIcon}
                </a>`;
    }

    function openProject(id, trigger) {
        const p = projects.find((item) => item.id === id);
        if (!p) return;
        lastTrigger = trigger || null;

        $('[data-modal-media]', modal).innerHTML = p.cover
            ? `<img src="${esc(p.cover)}" alt="Screenshot of ${esc(p.title)}">`
            : '';
        modal.classList.toggle('modal--no-media', !p.cover);
        $('[data-modal-meta]', modal).textContent = [p.type, p.status, p.year].filter(Boolean).join(', ');
        $('[data-modal-title]', modal).textContent = p.title;
        $('[data-modal-text]', modal).innerHTML = [
            `<p>${esc(p.summary)}</p>`,
            p.problem ? `<h3>Problem and solution</h3><p>${esc(p.problem)}</p>` : '',
            p.role ? `<h3>My role</h3><p>${esc(p.role)}</p>` : '',
            '<h3>Stack</h3>'
        ].join('');
        $('[data-modal-tags]', modal).innerHTML = (p.tags || []).map((t) => `<li>${esc(t)}</li>`).join('');
        $('[data-modal-links]', modal).innerHTML = [
            p.live ? linkButton(p.live, 'Open site', true) : '',
            p.repo ? linkButton(p.repo, 'Code on GitHub', !p.live) : '',
            p.note ? `<p class="modal__note">${esc(p.note)}</p>` : ''
        ].join('');

        modal.showModal();
        if (site.lenis) site.lenis.stop();

        const url = new URL(location.href);
        url.searchParams.set('project', id);
        history.replaceState(null, '', url);
    }

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) openProject(card.dataset.id, $('.card__open', card));
    });

    $('[data-modal-close]', modal).addEventListener('click', () => modal.close());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });

    modal.addEventListener('close', () => {
        if (site.lenis) site.lenis.start();
        const url = new URL(location.href);
        url.searchParams.delete('project');
        history.replaceState(null, '', url);
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });

    const initial = params.get('project');
    if (initial) Promise.resolve(site.ready).then(() => setTimeout(() => openProject(initial), 400));
})();
