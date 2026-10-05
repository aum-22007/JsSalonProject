/* ============================================================
   BOOKING PAGE — 4-step wizard driven by the BookingFlow
   state machine (State pattern). The draft is kept in the
   store so user input survives navigation within the session.
   ============================================================ */

import { SERVICES, getService, SALON } from '../data.js';
import { store, addAppointment, makeBookingId } from '../store.js';
import { BookingFlow, STEPS, STEP_META } from '../bookingFlow.js';
import { generateSlots, upcomingDates, hoursFor } from '../slots.js';
import { validate } from '../strategies.js';
import { icon, showToast, emptyStateHtml } from '../components.js';
import { navigate } from '../router.js';
import { formatINR, formatDuration, formatDate, formatTime, escapeHtml } from '../utils.js';

export function renderBooking(app, params) {
  const flow = new BookingFlow(store.get('bookingDraft'));

  // deep link: #/booking?service=s5 preselects the service
  if (params.service && getService(params.service)) {
    flow.selectService(params.service);
    if (flow.step === 'service') flow.step = 'datetime';
  }

  app.innerHTML = `
  <div class="container">
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a> ${icon('chevronRight', 12)} <span>Book an appointment</span></nav>
      <h1>Book an appointment</h1>
      <p>Four quick steps. Nothing is charged online — you pay at the salon after your service.</p>
    </div>
    <div class="booking-layout">
      <div class="card booking-panel">
        <div class="steps" data-steps role="list" aria-label="Booking progress"></div>
        <div data-step-body></div>
        <div class="booking-actions">
          <button class="btn btn--secondary" data-back>${icon('chevronLeft', 15)} Back</button>
          <button class="btn btn--primary btn--lg" data-next></button>
        </div>
      </div>
      <aside class="card booking-summary" aria-label="Booking summary">
        <h3>Your booking</h3>
        <div data-summary></div>
      </aside>
    </div>
  </div>`;

  const stepsEl = app.querySelector('[data-steps]');
  const bodyEl = app.querySelector('[data-step-body]');
  const summaryEl = app.querySelector('[data-summary]');
  const backBtn = app.querySelector('[data-back]');
  const nextBtn = app.querySelector('[data-next]');

  function persistDraft() { store.set('bookingDraft', flow.serialize()); }

  /* ---------- step indicator ---------- */
  function renderSteps() {
    stepsEl.innerHTML = STEPS.map((s, i) => {
      const done = flow.isComplete(s) && STEPS.indexOf(flow.step) > i;
      const current = flow.step === s;
      return `
        ${i > 0 ? '<span class="step-sep" aria-hidden="true"></span>' : ''}
        <span class="step ${current ? 'current' : ''} ${done ? 'done' : ''}" role="listitem" aria-current="${current ? 'step' : 'false'}">
          <span class="step-dot">${done ? icon('check', 13) : i + 1}</span>
          <span class="step-label">${STEP_META[s].label}</span>
        </span>`;
    }).join('');
  }

  /* ---------- summary sidebar (observer of flow data) ---------- */
  function renderSummary() {
    const s = flow.data.serviceId ? getService(flow.data.serviceId) : null;
    const rows = [
      ['Salon', SALON.name],
      ['Service', s ? s.name : '—'],
      ['Duration', s ? formatDuration(s.duration) : '—'],
      ['Date', flow.data.date ? formatDate(flow.data.date) : '—'],
      ['Time', flow.data.time ? formatTime(flow.data.time) : '—'],
      ['Name', flow.data.customer.name || '—'],
    ];
    summaryEl.innerHTML = `
      ${rows.map(([l, v]) => `<div class="summary-row"><span class="label">${l}</span><span class="value">${escapeHtml(v)}</span></div>`).join('')}
      <div class="summary-row summary-total"><span class="label">To pay at salon</span><span class="value">${s ? formatINR(s.price) : '—'}</span></div>
      <p class="summary-note">${icon('info', 14)} Free cancellation up to 2 hours before your slot.</p>`;
  }

  /* ---------- step bodies ---------- */
  function renderServiceStep() {
    bodyEl.innerHTML = `
      <h2>${STEP_META.service.title}</h2>
      <p class="panel-sub">Pick the service you\u2019d like to book. You can browse details on the <a href="#/services">services page</a>.</p>
      <div class="select-service-list">
        ${SERVICES.map((s) => `
          <button type="button" class="select-service-item ${flow.data.serviceId === s.serviceId ? 'selected' : ''}" data-svc="${s.serviceId}" aria-pressed="${flow.data.serviceId === s.serviceId}">
            <span class="ssi-radio" aria-hidden="true"></span>
            <img src="${s.image}" alt="" />
            <span class="ssi-body"><strong>${escapeHtml(s.name)}</strong><span>${formatDuration(s.duration)} · ${s.rating} ★</span></span>
            <span class="ssi-price">${formatINR(s.price)}</span>
          </button>`).join('')}
      </div>`;
    bodyEl.querySelectorAll('[data-svc]').forEach((btn) =>
      btn.addEventListener('click', () => {
        flow.selectService(btn.dataset.svc);
        persistDraft();
        render(); // re-render to reflect selection + enable Continue
      })
    );
  }

  function renderDatetimeStep() {
    const dates = upcomingDates(14);
    if (!flow.data.date || !dates.some((d) => d.dateStr === flow.data.date)) {
      const firstOpen = dates.find((d) => !d.closed);
      flow.data.date = firstOpen.dateStr;
    }
    const service = getService(flow.data.serviceId);

    bodyEl.innerHTML = `
      <h2>${STEP_META.datetime.title}</h2>
      <p class="panel-sub">Slots shown are live for <strong>${escapeHtml(service.name)}</strong> (${formatDuration(service.duration)}).</p>
      <h4 style="font-family:var(--font-body); font-size:var(--text-sm); font-weight:700; margin-bottom:var(--space-3)">Date</h4>
      <div class="date-strip" role="listbox" aria-label="Choose a date">
        ${dates.map((d) => `
          <button type="button" class="date-chip ${d.dateStr === flow.data.date ? 'selected' : ''} ${d.closed ? 'closed' : ''}"
            data-date="${d.dateStr}" role="option" aria-selected="${d.dateStr === flow.data.date}" ${d.closed ? 'aria-disabled="true"' : ''}>
            <span class="dow">${d.dow}</span><span class="dom">${d.dom}</span><span class="mon">${d.mon}</span>
          </button>`).join('')}
      </div>
      <h4 style="font-family:var(--font-body); font-size:var(--text-sm); font-weight:700; margin:var(--space-5) 0 var(--space-3)">Available times</h4>
      <div data-slot-area></div>`;

    const slotArea = bodyEl.querySelector('[data-slot-area]');

    function renderSlots() {
      const hours = hoursFor(flow.data.date);
      if (hours.closed) {
        slotArea.innerHTML = emptyStateHtml({
          iconName: 'clock',
          title: 'Closed on this day',
          text: `${SALON.name} stays closed on ${hours.day}s. Pick any other day of the week — Saturday has the longest hours.`,
        });
        return;
      }
      const slots = generateSlots(flow.data.date, getService(flow.data.serviceId).duration);
      const available = slots.filter((s) => s.available);
      if (!available.length) {
        slotArea.innerHTML = emptyStateHtml({
          iconName: 'clock',
          title: 'No slots left for this date',
          text: 'Everything is booked (or has already passed) for this day. Try the next available date — mornings usually have the most open slots.',
        });
        return;
      }
      slotArea.innerHTML = `
        <div class="slot-grid" role="listbox" aria-label="Choose a time">
          ${slots.map((s) => `
            <button type="button" class="slot ${flow.data.time === s.time ? 'selected' : ''}" data-time="${s.time}"
              role="option" aria-selected="${flow.data.time === s.time}" ${s.available ? '' : 'disabled'}>
              ${formatTime(s.time)}
            </button>`).join('')}
        </div>
        <p class="muted small" style="margin:var(--space-3) 0 0">${available.length} slot${available.length > 1 ? 's' : ''} available · struck-out times are already booked.</p>`;
      slotArea.querySelectorAll('[data-time]:not(:disabled)').forEach((btn) =>
        btn.addEventListener('click', () => {
          flow.selectTime(btn.dataset.time);
          persistDraft();
          slotArea.querySelectorAll('.slot').forEach((b) => {
            b.classList.toggle('selected', b.dataset.time === flow.data.time);
            b.setAttribute('aria-selected', String(b.dataset.time === flow.data.time));
          });
          renderSummary();
          updateButtons();
        })
      );
    }

    bodyEl.querySelectorAll('.date-chip:not(.closed)').forEach((btn) =>
      btn.addEventListener('click', () => {
        flow.selectDate(btn.dataset.date);
        persistDraft();
        bodyEl.querySelectorAll('.date-chip').forEach((b) => {
          b.classList.toggle('selected', b.dataset.date === flow.data.date);
          b.setAttribute('aria-selected', String(b.dataset.date === flow.data.date));
        });
        renderSlots();
        renderSummary();
        updateButtons();
      })
    );
    bodyEl.querySelectorAll('.date-chip.closed').forEach((btn) =>
      btn.addEventListener('click', () => showToast('The salon is closed on Tuesdays — pick another day.', 'info'))
    );

    renderSlots();
  }

  function renderDetailsStep() {
    const user = store.get('user');
    const c = flow.data.customer;
    // Preserve user input: prefill from draft first, then saved profile
    const val = (field) => c[field] || (user ? user[field] || '' : '');

    bodyEl.innerHTML = `
      <h2>${STEP_META.details.title}</h2>
      <p class="panel-sub">We\u2019ll use this to confirm your slot. ${user ? 'Prefilled from your profile — edit if needed.' : 'Save time next visit by filling your <a href="#/profile">profile</a> once.'}</p>
      <form class="form-grid" data-details-form novalidate>
        <div class="field" data-field="name">
          <label for="bk-name">Full name *</label>
          <input class="input" id="bk-name" name="name" type="text" value="${escapeHtml(val('name'))}" autocomplete="name" placeholder="e.g. Aarav Patel" />
          <p class="field-error" hidden></p>
        </div>
        <div class="field" data-field="phone">
          <label for="bk-phone">Mobile number *</label>
          <input class="input" id="bk-phone" name="phone" type="tel" value="${escapeHtml(val('phone'))}" autocomplete="tel" inputmode="numeric" placeholder="10-digit mobile number" />
          <p class="field-error" hidden></p>
        </div>
        <div class="field" data-field="email">
          <label for="bk-email">Email (optional)</label>
          <input class="input" id="bk-email" name="email" type="email" value="${escapeHtml(val('email'))}" autocomplete="email" placeholder="you@example.com" />
          <p class="field-error" hidden></p>
          <p class="hint">Only used for your booking summary.</p>
        </div>
        <div class="field field--full" data-field="notes">
          <label for="bk-notes">Anything we should know? (optional)</label>
          <textarea class="textarea" id="bk-notes" name="notes" placeholder="e.g. preferred stylist, allergies, reference photo description\u2026">${escapeHtml(c.notes || '')}</textarea>
        </div>
      </form>`;

    const form = bodyEl.querySelector('[data-details-form]');
    form.addEventListener('input', () => {
      flow.setCustomer({
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value,
        notes: form.notes.value,
      });
      persistDraft();
      renderSummary();
      updateButtons();
    });
  }

  /** Validate the details form; paints inline errors. Returns true when valid. */
  function validateDetails({ silent = false } = {}) {
    const c = flow.data.customer;
    const errors = validate({ name: c.name, phone: c.phone, email: c.email });
    if (!silent) {
      ['name', 'phone', 'email'].forEach((f) => {
        const wrap = bodyEl.querySelector(`[data-field="${f}"]`);
        if (!wrap) return;
        const errEl = wrap.querySelector('.field-error');
        if (errors[f]) {
          wrap.classList.add('field--invalid');
          errEl.innerHTML = `${icon('alert', 13)} ${escapeHtml(errors[f])}`;
          errEl.hidden = false;
        } else {
          wrap.classList.remove('field--invalid');
          errEl.hidden = true;
        }
      });
    }
    return Object.keys(errors).length === 0;
  }

  function renderConfirmStep() {
    const s = getService(flow.data.serviceId);
    const c = flow.data.customer;
    bodyEl.innerHTML = `
      <h2>${STEP_META.confirm.title}</h2>
      <p class="panel-sub">Check everything once — you can go back and change any step.</p>
      <div class="confirm-review">
        <div class="summary-row"><span class="label">Salon</span><span class="value">${SALON.name}, ${escapeHtml(SALON.area)}</span></div>
        <div class="summary-row"><span class="label">Service</span><span class="value">${escapeHtml(s.name)} · ${formatDuration(s.duration)}</span></div>
        <div class="summary-row"><span class="label">Date &amp; time</span><span class="value">${formatDate(flow.data.date)} · ${formatTime(flow.data.time)}</span></div>
        <div class="summary-row"><span class="label">Name</span><span class="value">${escapeHtml(c.name)}</span></div>
        <div class="summary-row"><span class="label">Mobile</span><span class="value">${escapeHtml(c.phone)}</span></div>
        ${c.email ? `<div class="summary-row"><span class="label">Email</span><span class="value">${escapeHtml(c.email)}</span></div>` : ''}
        ${c.notes ? `<div class="summary-row"><span class="label">Notes</span><span class="value">${escapeHtml(c.notes)}</span></div>` : ''}
        <div class="summary-row"><span class="label">Payment</span><span class="value">${formatINR(s.price)} — at the salon</span></div>
      </div>`;
  }

  /* ---------- confirm booking ---------- */
  function confirmBooking() {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Confirming\u2026';
    // small delay to show the loading state (simulated request)
    setTimeout(() => {
      const appt = {
        appointmentId: makeBookingId(),
        serviceId: flow.data.serviceId,
        date: flow.data.date,
        time: flow.data.time,
        status: 'upcoming',
        reviewed: false,
        customer: { ...flow.data.customer },
        createdAt: Date.now(),
      };
      addAppointment(appt);
      // remember details for next time
      const u = store.get('user') || {};
      store.set('user', { ...u, name: appt.customer.name, phone: appt.customer.phone, email: appt.customer.email });
      store.set('bookingDraft', null);
      showToast('Appointment confirmed — see you soon!');
      navigate(`#/confirmation/${appt.appointmentId}`);
    }, 700);
  }

  /* ---------- buttons ---------- */
  function updateButtons() {
    backBtn.style.visibility = flow.stepIndex() === 0 ? 'hidden' : 'visible';
    if (flow.step === 'confirm') {
      nextBtn.innerHTML = `${icon('check', 16)} Confirm booking`;
      nextBtn.disabled = false;
    } else {
      nextBtn.textContent = 'Continue';
      nextBtn.disabled = !flow.isComplete(flow.step);
    }
  }

  nextBtn.addEventListener('click', () => {
    if (flow.step === 'confirm') { confirmBooking(); return; }
    if (flow.step === 'details' && !validateDetails()) {
      showToast('Please fix the highlighted fields to continue.', 'error');
      return;
    }
    if (flow.next()) { persistDraft(); render(); }
  });

  backBtn.addEventListener('click', () => {
    if (flow.back()) { persistDraft(); render(); }
  });

  /* ---------- master render ---------- */
  function render() {
    renderSteps();
    renderSummary();
    updateButtons();
    switch (flow.step) {
      case 'service': renderServiceStep(); break;
      case 'datetime': renderDatetimeStep(); break;
      case 'details': renderDetailsStep(); break;
      case 'confirm': renderConfirmStep(); break;
    }
    // details step: silent validation drives the Continue button
    if (flow.step === 'details') {
      nextBtn.disabled = !flow.isComplete('details');
    }
  }

  render();
}
