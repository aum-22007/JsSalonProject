/* ============================================================
   SERVICE DETAIL PAGE
   ============================================================ */

import { getService, getCategory, SERVICES, SALON } from '../data.js';
import { icon, starsMarkup, serviceCardHtml, emptyStateHtml } from '../components.js';
import { formatINR, formatDuration, escapeHtml } from '../utils.js';

export function renderServiceDetail(app, params) {
  const service = getService(params.id);

  if (!service) {
    app.innerHTML = `
    <div class="container" style="padding-block:var(--space-8); max-width:520px">
      ${emptyStateHtml({
        iconName: 'alert',
        title: 'Service not found',
        text: 'This service may have been removed from the menu. Browse the current list of services instead.',
        actionHtml: '<a class="btn btn--primary" href="#/services">Browse services</a>',
      })}
    </div>`;
    return;
  }

  const cat = getCategory(service.category);
  const related = SERVICES
    .filter((s) => s.category === service.category && s.serviceId !== service.serviceId)
    .slice(0, 3);

  app.innerHTML = `
  <div class="container">
    <div class="page-head" style="padding-bottom:0">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="#/">Home</a> ${icon('chevronRight', 12)}
        <a href="#/services">Services</a> ${icon('chevronRight', 12)}
        <a href="#/services?cat=${service.category}">${escapeHtml(cat.name)}</a> ${icon('chevronRight', 12)}
        <span>${escapeHtml(service.name)}</span>
      </nav>
    </div>

    <div class="detail-layout">
      <div class="detail-img">
        <img src="${service.image}" alt="${escapeHtml(service.imageAlt)}" />
      </div>
      <div class="detail-info">
        <h1>${escapeHtml(service.name)}</h1>
        <div class="detail-meta">
          <span class="badge badge--accent">${escapeHtml(cat.name)}</span>
          <span class="rating-line">${starsMarkup(service.rating)} <strong>${service.rating}</strong> <span class="muted small">(${service.ratingCount} ratings)</span></span>
          <span class="chip">${icon('clock', 14)} ${formatDuration(service.duration)}</span>
        </div>
        <div class="detail-price">${formatINR(service.price)} <span>· pay at the salon</span></div>
        <p class="muted">${escapeHtml(service.description)}</p>

        <h3 style="font-family:var(--font-body); font-size:var(--text-base); font-weight:700; margin-top:var(--space-5)">What\u2019s included</h3>
        <ul class="includes-list">
          ${service.includes.map((i) => `<li>${icon('check', 16)} ${escapeHtml(i)}</li>`).join('')}
        </ul>

        <div class="detail-note">
          ${icon('info', 16)}
          <span>Performed at <strong>${escapeHtml(SALON.name)}</strong>, ${escapeHtml(SALON.area)}. Arrive 10 minutes early; your slot is held for 15 minutes.</span>
        </div>

        <div style="display:flex; gap:var(--space-3); flex-wrap:wrap">
          <a class="btn btn--primary btn--lg" href="#/booking?service=${service.serviceId}">Book now · ${formatINR(service.price)}</a>
          <a class="btn btn--secondary btn--lg" href="#/salon">View salon profile</a>
        </div>
      </div>
    </div>

    ${related.length ? `
    <section class="section" style="padding-top:0">
      <div class="section-head">
        <div>
          <span class="kicker">You might also like</span>
          <h2>More ${escapeHtml(cat.name.toLowerCase())} services</h2>
        </div>
      </div>
      <div class="service-grid">
        ${related.map(serviceCardHtml).join('')}
      </div>
    </section>` : ''}
  </div>`;
}
