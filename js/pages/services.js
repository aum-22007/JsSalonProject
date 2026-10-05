/* ============================================================
   SERVICES PAGE — browse, search, filter, sort.
   Uses the Strategy pattern (strategies.js) for filtering and
   sorting, so the UI only collects criteria and re-renders.
   ============================================================ */

import { SERVICES, CATEGORIES } from '../data.js';
import { applyFilters, applySort, SORT_LABELS } from '../strategies.js';
import { icon, serviceCardHtml, emptyStateHtml } from '../components.js';
import { navigate } from '../router.js';
import { escapeHtml } from '../utils.js';

export function renderServices(app, params) {
  // criteria = the single source of truth for this page's state
  const criteria = {
    search: params.q || '',
    category: params.cat || '',
    maxPrice: 0,
    minRating: 0,
    maxDuration: 0,
  };
  let sortKey = 'recommended';

  const catName = criteria.category
    ? (CATEGORIES.find((c) => c.id === criteria.category)?.name || '')
    : '';

  app.innerHTML = `
  <div class="container">
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a> ${icon('chevronRight', 12)} <span>Services</span></nav>
      <h1>${catName ? escapeHtml(catName) + ' services' : 'All services'}</h1>
      <p>Browse the full menu. Every price shown is final — you pay at the salon after your service.</p>
    </div>

    <div class="services-layout">
      <aside class="filter-panel" id="filter-panel" aria-label="Filters">
        <div class="card">
          <div class="filter-group">
            <h4>Category</h4>
            <label class="filter-option"><input type="radio" name="f-cat" value="" ${!criteria.category ? 'checked' : ''}/> All categories</label>
            ${CATEGORIES.map((c) => `
              <label class="filter-option"><input type="radio" name="f-cat" value="${c.id}" ${criteria.category === c.id ? 'checked' : ''}/> ${c.name}</label>`).join('')}
          </div>
          <div class="filter-group">
            <h4>Price</h4>
            <label class="filter-option"><input type="radio" name="f-price" value="0" checked/> Any price</label>
            <label class="filter-option"><input type="radio" name="f-price" value="500"/> Under \u20B9500</label>
            <label class="filter-option"><input type="radio" name="f-price" value="1000"/> Under \u20B91,000</label>
            <label class="filter-option"><input type="radio" name="f-price" value="1500"/> Under \u20B91,500</label>
          </div>
          <div class="filter-group">
            <h4>Rating</h4>
            <label class="filter-option"><input type="radio" name="f-rating" value="0" checked/> Any rating</label>
            <label class="filter-option"><input type="radio" name="f-rating" value="4.5"/> 4.5 ★ &amp; above</label>
            <label class="filter-option"><input type="radio" name="f-rating" value="4.8"/> 4.8 ★ &amp; above</label>
          </div>
          <div class="filter-group">
            <h4>Duration</h4>
            <label class="filter-option"><input type="radio" name="f-dur" value="0" checked/> Any duration</label>
            <label class="filter-option"><input type="radio" name="f-dur" value="30"/> 30 min or less</label>
            <label class="filter-option"><input type="radio" name="f-dur" value="60"/> 1 hour or less</label>
          </div>
          <button class="btn btn--secondary btn--block" data-reset style="margin-top:var(--space-4)">Reset all filters</button>
        </div>
      </aside>

      <div>
        <div class="services-toolbar">
          <div class="search-box">
            ${icon('search', 16)}
            <input class="input" type="search" data-search placeholder="Search services\u2026" value="${escapeHtml(criteria.search)}" aria-label="Search services" />
          </div>
          <button class="btn btn--secondary mobile-filter-btn" data-toggle-filters aria-expanded="false">${icon('filter', 15)} Filters</button>
          <label class="small muted" for="sort-select" style="margin-left:auto">Sort</label>
          <select class="select" id="sort-select" data-sort aria-label="Sort services">
            ${Object.entries(SORT_LABELS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <p class="results-count" data-count aria-live="polite"></p>
        <div data-results></div>
      </div>
    </div>
  </div>`;

  const resultsEl = app.querySelector('[data-results]');
  const countEl = app.querySelector('[data-count]');

  function update() {
    const filtered = applyFilters(SERVICES, criteria);
    const sorted = applySort(filtered, sortKey);
    countEl.textContent = sorted.length
      ? `Showing ${sorted.length} of ${SERVICES.length} services`
      : '';
    if (!sorted.length) {
      resultsEl.innerHTML = emptyStateHtml({
        iconName: 'search',
        title: 'No services found',
        text: criteria.search
          ? `Nothing matches “${criteria.search}” with the current filters. Try a different word, or clear the filters.`
          : 'No services match the current filters. Try widening your price, rating or duration filters.',
        actionHtml: '<button class="btn btn--primary" data-clear-all>Reset search &amp; filters</button>',
      });
      resultsEl.querySelector('[data-clear-all]').addEventListener('click', resetAll);
      return;
    }
    resultsEl.innerHTML = `<div class="service-grid">${sorted.map(serviceCardHtml).join('')}</div>`;
  }

  function resetAll() {
    navigate('#/services');
  }

  /* Controller wiring */
  let searchTimer;
  app.querySelector('[data-search]').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { criteria.search = e.target.value; update(); }, 180);
  });
  app.querySelector('[data-sort]').addEventListener('change', (e) => { sortKey = e.target.value; update(); });
  app.querySelectorAll('input[name="f-cat"]').forEach((r) =>
    r.addEventListener('change', () => { criteria.category = r.value; update(); }));
  app.querySelectorAll('input[name="f-price"]').forEach((r) =>
    r.addEventListener('change', () => { criteria.maxPrice = Number(r.value); update(); }));
  app.querySelectorAll('input[name="f-rating"]').forEach((r) =>
    r.addEventListener('change', () => { criteria.minRating = Number(r.value); update(); }));
  app.querySelectorAll('input[name="f-dur"]').forEach((r) =>
    r.addEventListener('change', () => { criteria.maxDuration = Number(r.value); update(); }));
  app.querySelector('[data-reset]').addEventListener('click', resetAll);

  const panel = app.querySelector('#filter-panel');
  app.querySelector('[data-toggle-filters]').addEventListener('click', (e) => {
    const open = panel.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });

  update();
}
