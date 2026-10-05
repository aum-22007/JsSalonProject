/* ============================================================
   MY APPOINTMENTS PAGE — upcoming & past bookings, cancel,
   and the post-appointment review flow.
   The list re-renders automatically when the appointments key
   changes in the store (Observer pattern).
   ============================================================ */

import { SALON, getService } from '../data.js';
import { store, updateAppointment, addReview } from '../store.js';
import { icon, statusBadge, emptyStateHtml, openModal, closeModal, confirmModal, showToast } from '../components.js';
import { validate } from '../strategies.js';
import { formatINR, formatTime, formatDuration, parseDate, escapeHtml } from '../utils.js';

export function renderAppointments(app) {
  let tab = 'upcoming';

  app.innerHTML = `
  <div class="container">
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a> ${icon('chevronRight', 12)} <span>My bookings</span></nav>
      <h1>My bookings</h1>
      <p>Everything you\u2019ve booked at ${SALON.name}, on this device.</p>
    </div>
    <div class="tabs" role="tablist" aria-label="Filter bookings" style="margin-bottom:var(--space-5)">
      <button role="tab" data-tab="upcoming" aria-selected="true" class="active">Upcoming</button>
      <button role="tab" data-tab="past" aria-selected="false">Past &amp; cancelled</button>
    </div>
    <div class="appt-list" data-list></div>
  </div>`;

  const listEl = app.querySelector('[data-list]');

  function renderList() {
    const all = store.get('appointments');
    const items = all
      .filter((a) => (tab === 'upcoming' ? a.status === 'upcoming' : a.status !== 'upcoming'))
      .sort((a, b) => (tab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

    if (!items.length) {
      listEl.innerHTML = emptyStateHtml({
        iconName: 'calendar',
        title: tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments yet',
        text: tab === 'upcoming'
          ? 'You don\u2019t have anything booked right now. Pick a service and grab a slot that suits you.'
          : 'Completed and cancelled appointments will show up here after your visits.',
        actionHtml: '<a class="btn btn--primary" href="#/booking">Book an appointment</a>',
      });
      return;
    }

    listEl.innerHTML = items.map((a) => {
      const s = getService(a.serviceId);
      const d = parseDate(a.date);
      return `
      <article class="card appt-card">
        <div class="appt-date-block" aria-hidden="true">
          <div class="dom">${d.getDate()}</div>
          <div class="mon">${d.toLocaleDateString('en-IN', { month: 'short' })}</div>
        </div>
        <div class="appt-info">
          <strong>${escapeHtml(s.name)}</strong>
          <div class="appt-meta">
            <span>${icon('clock', 13)} ${formatTime(a.time)} · ${formatDuration(s.duration)}</span>
            <span>${icon('pin', 13)} ${SALON.name}</span>
            <span>${formatINR(s.price)}</span>
          </div>
          <div class="bk-id">Booking ID: ${a.appointmentId}</div>
        </div>
        <div class="appt-side">
          ${statusBadge(a.status)}
          ${a.status === 'upcoming' ? `
            <a class="btn btn--secondary btn--sm" href="#/confirmation/${a.appointmentId}">View details</a>
            <button class="btn btn--danger btn--sm" data-cancel="${a.appointmentId}">Cancel</button>` : ''}
          ${a.status === 'completed' && !a.reviewed ? `
            <button class="btn btn--primary btn--sm" data-review="${a.appointmentId}">${icon('star', 13)} Leave a review</button>` : ''}
          ${a.status === 'completed' && a.reviewed ? `
            <span class="badge badge--neutral">${icon('check', 12)} Review submitted</span>` : ''}
        </div>
      </article>`;
    }).join('');

    listEl.querySelectorAll('[data-cancel]').forEach((btn) =>
      btn.addEventListener('click', () => {
        const id = btn.dataset.cancel;
        confirmModal({
          title: 'Cancel this appointment?',
          text: 'Your slot will be released for other customers. You can always book again — cancellation is free up to 2 hours before the slot.',
          confirmLabel: 'Yes, cancel it',
          onConfirm: () => {
            updateAppointment(id, { status: 'cancelled' });
            showToast('Appointment cancelled. The slot has been released.', 'info');
          },
        });
      })
    );

    listEl.querySelectorAll('[data-review]').forEach((btn) =>
      btn.addEventListener('click', () => openReviewModal(btn.dataset.review))
    );
  }

  app.querySelectorAll('[data-tab]').forEach((btn) =>
    btn.addEventListener('click', () => {
      tab = btn.dataset.tab;
      app.querySelectorAll('[data-tab]').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      renderList();
    })
  );

  // Observer: when appointments change (cancel/review), refresh the list
  const unsub = store.subscribe('appointments', renderList);
  window.addEventListener('hashchange', () => unsub(), { once: true });

  renderList();
}

/* ---------------- Review modal ---------------- */
function openReviewModal(appointmentId) {
  const appt = store.get('appointments').find((a) => a.appointmentId === appointmentId);
  const service = getService(appt.serviceId);
  let rating = 0;

  const body = document.createElement('div');
  body.innerHTML = `
    <p class="muted small" style="margin-top:0">${escapeHtml(service.name)} · Booking ${appt.appointmentId}</p>
    <div class="field">
      <label id="rate-label">Your rating *</label>
      <div class="star-input" role="radiogroup" aria-labelledby="rate-label">
        ${[1, 2, 3, 4, 5].map((n) => `
          <button type="button" data-star="${n}" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>`).join('')}
      </div>
      <p class="field-error" data-rating-err hidden></p>
    </div>
    <div class="field" data-field="review">
      <label for="rv-text">Your review *</label>
      <textarea class="textarea" id="rv-text" placeholder="How was the service, the stylist, the wait\u2026?"></textarea>
      <p class="field-error" hidden></p>
    </div>
    <button class="btn btn--primary btn--block btn--lg" data-submit>Submit review</button>`;

  openModal({
    title: 'How was your visit?',
    subtitle: 'Your review appears on the salon profile and helps others decide.',
    body,
  });

  const starBtns = body.querySelectorAll('[data-star]');
  starBtns.forEach((b) =>
    b.addEventListener('click', () => {
      rating = Number(b.dataset.star);
      starBtns.forEach((sb) => {
        const on = Number(sb.dataset.star) <= rating;
        sb.classList.toggle('on', on);
        sb.setAttribute('aria-checked', String(Number(sb.dataset.star) === rating));
      });
      body.querySelector('[data-rating-err]').hidden = true;
    })
  );

  body.querySelector('[data-submit]').addEventListener('click', () => {
    const text = body.querySelector('#rv-text').value;
    const errors = validate({ review: text });
    let ok = true;

    const ratingErr = body.querySelector('[data-rating-err]');
    if (!rating) {
      ratingErr.innerHTML = `${icon('alert', 13)} Please tap a star rating first.`;
      ratingErr.hidden = false;
      ok = false;
    }
    const wrap = body.querySelector('[data-field="review"]');
    const errEl = wrap.querySelector('.field-error');
    if (errors.review) {
      wrap.classList.add('field--invalid');
      errEl.innerHTML = `${icon('alert', 13)} ${escapeHtml(errors.review)}`;
      errEl.hidden = false;
      ok = false;
    } else {
      wrap.classList.remove('field--invalid');
      errEl.hidden = true;
    }
    if (!ok) return;

    addReview({
      reviewId: `r-${Date.now()}`,
      name: appt.customer.name || store.get('user')?.name || 'Velora Customer',
      rating,
      comment: text.trim(),
      serviceName: service.name,
      appointmentId: appt.appointmentId,
    });
    updateAppointment(appt.appointmentId, { reviewed: true });
    closeModal();
    showToast('Thanks! Your review is now live on the salon profile.');
  });
}
