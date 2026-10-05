/* ============================================================
   HOME PAGE
   ============================================================ */

import { SALON, CATEGORIES, SERVICES, WHY_CHOOSE_US } from '../data.js';
import { store } from '../store.js';
import { icon, serviceCardHtml, categoryCardHtml, reviewCardHtml, openLocationModal, starsMarkup } from '../components.js';
import { navigate } from '../router.js';
import { escapeHtml } from '../utils.js';

export function renderHome(app) {
  const popular = SERVICES.filter((s) => s.popular).slice(0, 6);
  const reviews = store.get('reviews').slice(0, 3);
  const loc = store.get('location');

  app.innerHTML = `
  <!-- Hero -->
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">${icon('sparkle', 14)} College Road, Nadiad</span>
        <h1>Your next salon appointment, without the hassle.</h1>
        <p class="lede">Pick a service, choose a slot, walk in on time. Fixed prices, no phone calls, and you pay at the salon after your service.</p>
        <form class="hero-search" data-hero-search role="search">
          <button type="button" class="hero-loc" data-open-location aria-label="Change location">
            ${icon('pin', 15)}<span class="loc-text" data-loc-label>${loc ? escapeHtml(loc.label) : 'Set location'}</span>
          </button>
          <input type="search" name="q" placeholder="Search haircut, facial, spa\u2026" aria-label="Search services" />
          <button class="btn btn--primary" type="submit">${icon('search', 15)} Search</button>
        </form>
        <div class="hero-meta">
          <div class="meta-item"><strong>${SALON.rating} ★</strong> ${SALON.reviewCount}+ reviews</div>
          <div class="meta-item"><strong>${SERVICES.length} services</strong> hair · skin · grooming</div>
          <div class="meta-item"><strong>Since ${SALON.established}</strong> serving Nadiad</div>
        </div>
      </div>
      <div class="hero-visual">
        <img src="images/hero.jpg" alt="Inside Velora Studio — styling chairs, mirrors and warm lighting" />
        <div class="hero-card">
          <span class="tick">${icon('check', 16)}</span>
          <span><strong>Slot confirmed instantly</strong><span>No calls. No waiting in queue.</span></span>
        </div>
      </div>
    </div>
  </section>

  <!-- Categories -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Browse by category</span>
          <h2>What are you here for?</h2>
        </div>
        <a class="btn btn--ghost" href="#/services">All services ${icon('arrowRight', 14)}</a>
      </div>
      <div class="category-grid">
        ${CATEGORIES.map(categoryCardHtml).join('')}
      </div>
    </div>
  </section>

  <!-- Popular services -->
  <section class="section section--tint">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Most booked</span>
          <h2>Popular services</h2>
          <p>The services our regulars keep coming back for.</p>
        </div>
        <a class="btn btn--secondary" href="#/services">View all ${SERVICES.length} services</a>
      </div>
      <div class="service-grid">
        ${popular.map(serviceCardHtml).join('')}
      </div>
    </div>
  </section>

  <!-- About -->
  <section class="section">
    <div class="container about-strip">
      <img src="images/interior.jpg" alt="Reception area of Velora Studio with product shelves" loading="lazy" />
      <div>
        <span class="kicker">About the salon</span>
        <h2>A salon that respects your time</h2>
        <p class="muted">${escapeHtml(SALON.description)}</p>
        <ul class="about-points">
          <li>${icon('check', 16)} Appointments honoured on time — your chair is held for you</li>
          <li>${icon('check', 16)} Prices fixed and displayed before you book</li>
          <li>${icon('check', 16)} Pay after your service at the counter: cash, UPI or card</li>
        </ul>
        <a class="btn btn--dark" href="#/salon">Visit the salon profile</a>
      </div>
    </div>
  </section>

  <!-- Why choose us -->
  <section class="section section--tint">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Why Velora</span>
          <h2>Small things, done consistently</h2>
        </div>
      </div>
      <div class="why-grid">
        ${WHY_CHOOSE_US.map((w) => `
          <div class="why-card">
            <span class="why-icon">${icon(w.icon, 20)}</span>
            <h3>${escapeHtml(w.title)}</h3>
            <p>${escapeHtml(w.text)}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Gallery -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Inside the studio</span>
          <h2>Take a look around</h2>
        </div>
      </div>
      <div class="gallery-grid">
        ${SALON.gallery.map((g) => `<img src="${g.src}" alt="${escapeHtml(g.alt)}" loading="lazy" />`).join('')}
      </div>
    </div>
  </section>

  <!-- Reviews -->
  <section class="section section--tint">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="kicker">Customer reviews</span>
          <h2>What people say after the chair</h2>
          <p><span class="rating-line">${starsMarkup(SALON.rating)} <strong>${SALON.rating}</strong> from ${SALON.reviewCount}+ verified visits</span></p>
        </div>
        <a class="btn btn--ghost" href="#/salon?sec=reviews">Read all reviews ${icon('arrowRight', 14)}</a>
      </div>
      <div class="review-grid">
        ${reviews.map(reviewCardHtml).join('')}
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="section">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>Ready when you are</h2>
          <p>Book a slot in under a minute. If plans change, cancel from “My Bookings” — no questions asked.</p>
        </div>
        <a class="btn btn--primary btn--lg" href="#/booking">Book an appointment</a>
      </div>
    </div>
  </section>`;

  // Controller wiring
  app.querySelector('[data-hero-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    navigate(q ? `#/services?q=${encodeURIComponent(q)}` : '#/services');
  });
  app.querySelector('[data-open-location]').addEventListener('click', () => openLocationModal());
}
