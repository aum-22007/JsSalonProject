/* ============================================================
   SALON PROFILE PAGE — everything a customer needs to feel
   confident booking: about, services & prices, photos,
   amenities, hours, contact and reviews.
   ============================================================ */

import { SALON, CATEGORIES, SERVICES } from '../data.js';
import { store } from '../store.js';
import { icon, starsMarkup, reviewCardHtml, emptyStateHtml } from '../components.js';
import { openNowInfo } from '../slots.js';
import { formatINR, formatDuration, escapeHtml } from '../utils.js';

export function renderSalonProfile(app, params) {
  const reviews = store.get('reviews');
  const open = openNowInfo();
  const todayIdx = new Date().getDay();

  // rating distribution for the summary bars
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...dist.map((d) => d.count));
  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : SALON.rating;

  app.innerHTML = `
  <div class="salon-cover">
    <img src="images/hero.jpg" alt="Interior of ${escapeHtml(SALON.name)}" />
  </div>

  <div class="container">
    <div class="salon-head-card">
      <div>
        <h1>${escapeHtml(SALON.name)}</h1>
        <div class="salon-head-meta">
          <span class="rating-line">${starsMarkup(SALON.rating)} <strong>${SALON.rating}</strong> (${SALON.reviewCount}+ reviews)</span>
          <span class="dot">•</span>
          <span>${icon('pin', 14)} ${escapeHtml(SALON.area)}</span>
          <span class="dot">•</span>
          <span class="open-badge">${open.open ? '<span class="pulse"></span>' : ''}<strong style="color:${open.open ? 'var(--color-success)' : 'var(--color-danger)'}">${open.label}</strong></span>
        </div>
        <p class="muted small" style="margin:var(--space-3) 0 0">${escapeHtml(SALON.tagline)} · Since ${SALON.established}</p>
      </div>
      <div class="salon-head-actions">
        <a class="btn btn--secondary" href="tel:${SALON.phone.replace(/\s/g, '')}">${icon('phone', 15)} Call</a>
        <a class="btn btn--primary btn--lg" href="#/booking">Book an appointment</a>
      </div>
    </div>

    <div class="salon-layout">
      <div class="salon-main">
        <section aria-labelledby="about-h">
          <h2 id="about-h">About</h2>
          <p class="muted">${escapeHtml(SALON.description)}</p>
        </section>

        <section aria-labelledby="services-h">
          <h2 id="services-h">Services &amp; prices</h2>
          ${CATEGORIES.map((cat) => {
            const list = SERVICES.filter((s) => s.category === cat.id);
            if (!list.length) return '';
            return `
            <div class="card" style="margin-bottom:var(--space-4); padding:var(--space-2) var(--space-5)">
              <h3 style="font-family:var(--font-body); font-size:var(--text-sm); font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--color-ink-soft); margin:var(--space-4) 0 var(--space-2)">${cat.name}</h3>
              ${list.map((s) => `
                <div class="svc-row">
                  <img src="${s.image}" alt="" loading="lazy" />
                  <div class="svc-row-body">
                    <strong><a href="#/service/${s.serviceId}" style="color:inherit">${escapeHtml(s.name)}</a></strong>
                    <span>${formatDuration(s.duration)} · ${s.rating} ★</span>
                  </div>
                  <span class="svc-row-price">${formatINR(s.price)}</span>
                  <a class="btn btn--secondary btn--sm" href="#/booking?service=${s.serviceId}">Book</a>
                </div>`).join('')}
            </div>`;
          }).join('')}
        </section>

        <section aria-labelledby="photos-h">
          <h2 id="photos-h">Photos</h2>
          <div class="gallery-grid">
            ${SALON.gallery.map((g) => `<img src="${g.src}" alt="${escapeHtml(g.alt)}" loading="lazy" />`).join('')}
          </div>
        </section>

        <section aria-labelledby="amenities-h">
          <h2 id="amenities-h">Amenities</h2>
          <div style="display:flex; flex-wrap:wrap; gap:var(--space-2)">
            ${SALON.amenities.map((a) => `<span class="chip">${icon(a.icon, 15)} ${escapeHtml(a.label)}</span>`).join('')}
          </div>
        </section>

        <section aria-labelledby="reviews-h" id="reviews-sec">
          <h2 id="reviews-h">Reviews</h2>
          ${reviews.length ? `
            <div class="rating-summary card" style="padding:var(--space-5)">
              <div class="rating-big">
                <div class="num">${avg}</div>
                ${starsMarkup(Number(avg))}
                <p class="muted small" style="margin:var(--space-1) 0 0">${reviews.length} written reviews</p>
              </div>
              <div class="rating-bars">
                ${dist.map((d) => `
                  <div class="rating-bar-row">
                    <span style="width:28px">${d.star} ★</span>
                    <span class="bar"><i style="width:${(d.count / maxCount) * 100}%"></i></span>
                    <span style="width:20px; text-align:right">${d.count}</span>
                  </div>`).join('')}
              </div>
            </div>
            <div class="review-list">
              ${reviews.map(reviewCardHtml).join('')}
            </div>`
          : emptyStateHtml({
              iconName: 'edit',
              title: 'No reviews yet',
              text: 'Once customers complete appointments, their reviews will appear here. Be the first — book a service and share your experience.',
              actionHtml: '<a class="btn btn--primary" href="#/booking">Book an appointment</a>',
            })}
        </section>
      </div>

      <aside class="salon-aside">
        <div class="card aside-card">
          <h3>Opening hours</h3>
          ${SALON.openingHours.map((h, i) => `
            <div class="hours-row ${i === todayIdx ? 'today' : ''}">
              <span>${h.day}${i === todayIdx ? ' (today)' : ''}</span>
              <span class="${h.closed ? 'closed-txt' : ''}">${h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
            </div>`).join('')}
        </div>
        <div class="card aside-card">
          <h3>Contact &amp; location</h3>
          <div class="contact-row">${icon('pin', 16)}<span>${escapeHtml(SALON.location)}</span></div>
          <div class="contact-row">${icon('phone', 16)}<a href="tel:${SALON.phone.replace(/\s/g, '')}">${SALON.phone}</a></div>
          <div class="contact-row">${icon('mail', 16)}<a href="mailto:${SALON.email}">${SALON.email}</a></div>
          <a class="btn btn--dark btn--block" href="#/booking" style="margin-top:var(--space-4)">Book an appointment</a>
          <p class="summary-note">${icon('info', 14)} Payment is taken at the salon after your service.</p>
        </div>
      </aside>
    </div>
  </div>`;

  if (params.sec === 'reviews') {
    requestAnimationFrame(() => {
      document.getElementById('reviews-sec')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
