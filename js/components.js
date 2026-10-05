/* ============================================================
   REUSABLE COMPONENTS (the "V" in MVC)
   Small render functions that return HTML strings, plus a few
   imperative widgets (modal, toast). Pages compose these.
   ============================================================ */

import { SALON, CATEGORIES, CITIES, SERVICES } from './data.js';
import { store } from './store.js';
import { formatINR, formatDuration, escapeHtml, initials } from './utils.js';

/* ---------------- Icons (inline SVG, stroke style) ---------------- */
const PATHS = {
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="9.12" x2="12" y2="13"/>',
  razor: '<path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L4 14l-1 7 7-1 7-7"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.4L22 18l-2.1.6L19 21l-.9-2.4L16 18l2.1-.6z"/>',
  lotus: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  hand: '<path d="M9 11h6v9a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="M10.5 7h3v4h-3z"/><path d="M11.5 3h1v4h-1z"/>',
  brush: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2"/><path d="M12.59 19.41A2 2 0 1 0 14 16H2"/><path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
  droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
  coffee: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
};

export function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;
}

function starSvg(filled, size = 15) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" class="${filled ? '' : 'star-empty'}" aria-hidden="true">${PATHS.star}</svg>`;
}

export function starsMarkup(rating, size = 15) {
  let html = '';
  for (let i = 1; i <= 5; i++) html += starSvg(i <= Math.round(rating), size);
  return `<span class="stars" role="img" aria-label="Rated ${rating} out of 5">${html}</span>`;
}

/* ---------------- Toast notifications ---------------- */
export function showToast(message, type = 'success') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', 'status');
  const icons = { success: 'checkCircle', error: 'alert', info: 'info' };
  el.innerHTML = `${icon(icons[type] || 'info', 18)}<span>${escapeHtml(message)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 300);
  }, 3400);
}

/* ---------------- Modal ---------------- */
let activeModalCleanup = null;

export function openModal({ title, subtitle = '', body = '' }) {
  closeModal();
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" data-overlay>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="modal-head">
          <div>
            <h3>${escapeHtml(title)}</h3>
            ${subtitle ? `<p class="muted">${escapeHtml(subtitle)}</p>` : ''}
          </div>
          <button class="modal-close" data-close aria-label="Close dialog">${icon('x', 16)}</button>
        </div>
        <div class="modal-body"></div>
      </div>
    </div>`;
  const overlay = root.querySelector('[data-overlay]');
  const bodyEl = root.querySelector('.modal-body');
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else bodyEl.appendChild(body);

  const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(); });
  root.querySelector('[data-close]').addEventListener('click', closeModal);
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  activeModalCleanup = () => {
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
  };
  const focusable = bodyEl.querySelector('input, button, textarea');
  if (focusable) focusable.focus();
  return bodyEl;
}

export function closeModal() {
  if (activeModalCleanup) { activeModalCleanup(); activeModalCleanup = null; }
  document.getElementById('modal-root').innerHTML = '';
}

export function confirmModal({ title, text, confirmLabel = 'Confirm', onConfirm }) {
  const body = document.createElement('div');
  body.innerHTML = `
    <p class="muted" style="margin-top:0">${escapeHtml(text)}</p>
    <div style="display:flex; gap:var(--space-3); justify-content:flex-end; margin-top:var(--space-5)">
      <button class="btn btn--secondary" data-cancel>Keep it</button>
      <button class="btn btn--danger" data-ok>${escapeHtml(confirmLabel)}</button>
    </div>`;
  openModal({ title, body });
  body.querySelector('[data-cancel]').addEventListener('click', closeModal);
  body.querySelector('[data-ok]').addEventListener('click', () => { closeModal(); onConfirm(); });
}

/* ---------------- Cards ---------------- */
export function serviceCardHtml(s) {
  const cat = CATEGORIES.find((c) => c.id === s.category);
  return `
  <article class="card card--hover service-card">
    <a class="svc-img" href="#/service/${s.serviceId}" aria-label="View details of ${escapeHtml(s.name)}">
      <img src="${s.image}" alt="${escapeHtml(s.imageAlt)}" loading="lazy" />
      <span class="badge">${escapeHtml(cat ? cat.name : s.category)}</span>
    </a>
    <div class="svc-body">
      <h3><a href="#/service/${s.serviceId}" style="color:inherit">${escapeHtml(s.name)}</a></h3>
      <span class="rating-line">${starsMarkup(s.rating)} <strong>${s.rating}</strong> <span class="muted small">(${s.ratingCount})</span></span>
      <p class="svc-desc">${escapeHtml(s.description)}</p>
      <div class="svc-meta">${icon('clock', 14)} ${formatDuration(s.duration)}</div>
      <div class="svc-foot">
        <span class="svc-price">${formatINR(s.price)} <span>pay at salon</span></span>
        <a class="btn btn--primary btn--sm" href="#/booking?service=${s.serviceId}">Book</a>
      </div>
    </div>
  </article>`;
}

export function categoryCardHtml(c) {
  const count = SERVICES.filter((s) => s.category === c.id).length;
  return `
  <a class="category-card" href="#/services?cat=${c.id}">
    <span class="cat-icon">${icon(c.icon, 22)}</span>
    <span>
      <span class="cat-name">${escapeHtml(c.name)}</span><br/>
      <span class="cat-count">${count} service${count > 1 ? 's' : ''}</span>
    </span>
  </a>`;
}

export function reviewCardHtml(r) {
  return `
  <article class="review-card">
    <span class="rating-line">${starsMarkup(r.rating)} <strong>${r.rating}.0</strong></span>
    <p class="review-text">\u201C${escapeHtml(r.comment)}\u201D</p>
    <div class="reviewer">
      <span class="avatar" aria-hidden="true">${initials(r.name)}</span>
      <span><strong>${escapeHtml(r.name)}</strong><span>${escapeHtml(r.serviceName || '')}${r.serviceName ? ' \u00b7 ' : ''}${new Date(r.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></span>
    </div>
  </article>`;
}

export function emptyStateHtml({ iconName = 'search', title, text, actionHtml = '' }) {
  return `
  <div class="empty-state">
    <span class="empty-icon">${icon(iconName, 24)}</span>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${actionHtml}
  </div>`;
}

export function statusBadge(status) {
  const map = {
    upcoming: ['badge--accent', 'Upcoming'],
    completed: ['badge--success', 'Completed'],
    cancelled: ['badge--danger', 'Cancelled'],
  };
  const [cls, label] = map[status] || ['badge--neutral', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

/* ---------------- Header / Footer / Bottom nav ---------------- */
const NAV_LINKS = [
  { href: '#/', label: 'Home', match: '/' },
  { href: '#/services', label: 'Services', match: '/services' },
  { href: '#/salon', label: 'About', match: '/salon' },
  { href: '#/salon?sec=reviews', label: 'Reviews', match: '/salon?reviews' },
  { href: '#/appointments', label: 'My Bookings', match: '/appointments' },
];

export function renderHeader() {
  const header = document.getElementById('site-header');
  header.innerHTML = `
    <div class="container nav-inner">
      <a class="brand" href="#/">Velora Studio <span class="brand-dot"></span></a>
      <nav class="nav-links" aria-label="Primary">
        ${NAV_LINKS.map((l) => `<a href="${l.href}" data-match="${l.match}">${l.label}</a>`).join('')}
      </nav>
      <button class="nav-location" data-open-location aria-label="Change location">
        ${icon('pin', 15)}<span class="loc-text" data-loc-label>Set location</span>
      </button>
      <a class="btn btn--primary nav-cta" href="#/booking">Book now</a>
    </div>`;
  header.querySelector('[data-open-location]').addEventListener('click', () => openLocationModal());
  syncLocationLabels();
}

export function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  const items = [
    { href: '#/', label: 'Home', iconName: 'home', match: '/' },
    { href: '#/services', label: 'Services', iconName: 'grid', match: '/services' },
    { href: '#/booking', label: 'Book', iconName: 'calendar', match: '/booking' },
    { href: '#/appointments', label: 'Bookings', iconName: 'clock', match: '/appointments' },
    { href: '#/profile', label: 'Profile', iconName: 'user', match: '/profile' },
  ];
  nav.innerHTML = items
    .map((i) => `<a href="${i.href}" data-match="${i.match}">${icon(i.iconName, 21)}<span>${i.label}</span></a>`)
    .join('');
}

export function setActiveNav(path) {
  document.querySelectorAll('[data-match]').forEach((a) => {
    const m = a.getAttribute('data-match');
    const active = m === '/' ? path === '/' : path.startsWith(m.split('?')[0]) && !m.includes('?');
    a.classList.toggle('active', active);
  });
}

export function renderFooter() {
  const footer = document.getElementById('site-footer');
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="#/">Velora Studio <span class="brand-dot"></span></a>
          <p>A neighbourhood salon on College Road, Nadiad — serving hair, skin and grooming since ${SALON.established}. Book online, pay at the salon.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#/services">All services</a></li>
            <li><a href="#/salon">About the salon</a></li>
            <li><a href="#/salon?sec=reviews">Reviews</a></li>
            <li><a href="#/appointments">My bookings</a></li>
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            ${CATEGORIES.map((c) => `<li><a href="#/services?cat=${c.id}">${c.name}</a></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4>Visit us</h4>
          <ul>
            <li>${escapeHtml(SALON.location)}</li>
            <li><a href="tel:${SALON.phone.replace(/\s/g, '')}">${SALON.phone}</a></li>
            <li><a href="mailto:${SALON.email}">${SALON.email}</a></li>
            <li>Wed–Mon · 10:00 AM – 8:00 PM<br/>Closed on Tuesdays</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Velora Studio. All rights reserved.</span>
        <span>Walk-ins welcome, appointments preferred.</span>
      </div>
    </div>`;
}

function syncLocationLabels() {
  const loc = store.get('location');
  document.querySelectorAll('[data-loc-label]').forEach((el) => {
    el.textContent = loc ? loc.label : 'Set location';
  });
}
store.subscribe('location', syncLocationLabels);

/* ---------------- Location modal ---------------- */
export function openLocationModal({ required = false } = {}) {
  const body = document.createElement('div');
  body.innerHTML = `
    <div data-alert-slot></div>
    <button class="loc-option" data-detect>
      <span class="loc-icon">${icon('navigation', 18)}</span>
      <span style="flex:1">
        <strong>Use my current location</strong>
        <span>Allow location access to detect where you are</span>
      </span>
      ${icon('chevronRight', 16)}
    </button>
    <div class="loc-divider">or choose manually</div>
    <div class="field" style="margin-bottom:0">
      <label for="city-search">Search your city</label>
      <input class="input" id="city-search" type="text" placeholder="e.g. Nadiad" autocomplete="off" />
    </div>
    <div class="city-list" data-city-list></div>`;

  openModal({
    title: 'Where are you?',
    subtitle: 'We use this to show distance and travel info for the salon.',
    body,
  });

  const alertSlot = body.querySelector('[data-alert-slot]');
  const listEl = body.querySelector('[data-city-list]');
  const searchEl = body.querySelector('#city-search');

  const pick = (label, source) => {
    store.set('location', { label, source });
    closeModal();
    showToast(`Location set to ${label}`);
  };

  const renderList = (query = '') => {
    const q = query.trim().toLowerCase();
    const matches = CITIES.filter((c) => c.toLowerCase().includes(q));
    if (!matches.length) {
      listEl.innerHTML = `<p class="muted small" style="padding:var(--space-2) var(--space-3); margin:0">No matching city. We currently serve the Kheda–Anand region — pick the closest city from the list.</p>`;
      return;
    }
    listEl.innerHTML = matches
      .map((c) => `<button class="city-item" data-city="${escapeHtml(c)}">${icon('pin', 15)} ${escapeHtml(c)}</button>`)
      .join('');
    listEl.querySelectorAll('[data-city]').forEach((btn) =>
      btn.addEventListener('click', () => pick(btn.dataset.city, 'manual'))
    );
  };
  renderList();
  searchEl.addEventListener('input', () => renderList(searchEl.value));

  body.querySelector('[data-detect]').addEventListener('click', () => {
    const btn = body.querySelector('[data-detect] strong');
    btn.textContent = 'Detecting your location\u2026';
    if (!navigator.geolocation) {
      btn.textContent = 'Use my current location';
      alertSlot.innerHTML = `<div class="loc-alert">${icon('alert', 16)}<span>Your browser doesn\u2019t support location detection. Please pick your city below instead.</span></div>`;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => pick('Nadiad, Gujarat', 'detected'),
      () => {
        btn.textContent = 'Use my current location';
        alertSlot.innerHTML = `<div class="loc-alert">${icon('alert', 16)}<span>Location access was denied — that\u2019s completely fine. Just choose your city manually below.</span></div>`;
        searchEl.focus();
      },
      { timeout: 8000 }
    );
  });

  if (required) {
    // soft-required: closing without choosing defaults to the salon's city
    const prevCleanup = () => {
      if (!store.get('location')) store.set('location', { label: 'Nadiad, Gujarat', source: 'default' });
    };
    store.subscribe('location', () => {});
    document.getElementById('modal-root').addEventListener('click', () => {
      if (!document.getElementById('modal-root').children.length) prevCleanup();
    }, { once: true });
  }
}
