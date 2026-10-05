/* ============================================================
   PROFILE PAGE — lightweight local profile. Details saved here
   prefill the booking form. No real authentication is needed
   for this project; data stays on the device.
   ============================================================ */

import { store } from '../store.js';
import { icon, showToast, confirmModal, openLocationModal } from '../components.js';
import { validate } from '../strategies.js';
import { escapeHtml, initials } from '../utils.js';

export function renderProfile(app) {
  const user = store.get('user');
  const loc = store.get('location');
  const appts = store.get('appointments');
  const visits = appts.filter((a) => a.status === 'completed').length;

  app.innerHTML = `
  <div class="container">
    <div class="page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a> ${icon('chevronRight', 12)} <span>Profile</span></nav>
      <h1>Your profile</h1>
      <p>Saved on this device only — used to prefill your bookings so you never type the same thing twice.</p>
    </div>

    <div class="profile-wrap">
      <div class="card profile-card">
        <div class="profile-head">
          <span class="avatar-lg">${user && user.name ? initials(user.name) : icon('user', 22)}</span>
          <div>
            <strong>${user && user.name ? escapeHtml(user.name) : 'Guest'}</strong>
            <p class="muted small" style="margin:0">${visits} completed visit${visits === 1 ? '' : 's'} · ${appts.filter((a) => a.status === 'upcoming').length} upcoming</p>
          </div>
        </div>

        <form data-profile-form novalidate>
          <div class="field" data-field="name">
            <label for="pf-name">Full name</label>
            <input class="input" id="pf-name" name="name" type="text" value="${escapeHtml(user?.name || '')}" autocomplete="name" placeholder="Your name" />
            <p class="field-error" hidden></p>
          </div>
          <div class="field" data-field="phone">
            <label for="pf-phone">Mobile number</label>
            <input class="input" id="pf-phone" name="phone" type="tel" value="${escapeHtml(user?.phone || '')}" autocomplete="tel" inputmode="numeric" placeholder="10-digit mobile number" />
            <p class="field-error" hidden></p>
          </div>
          <div class="field" data-field="email">
            <label for="pf-email">Email</label>
            <input class="input" id="pf-email" name="email" type="email" value="${escapeHtml(user?.email || '')}" autocomplete="email" placeholder="you@example.com" />
            <p class="field-error" hidden></p>
          </div>
          <button class="btn btn--primary btn--block" type="submit">Save details</button>
        </form>
      </div>

      <div class="card profile-card" style="margin-top:var(--space-4)">
        <h3 style="font-family:var(--font-body); font-size:var(--text-base); font-weight:700">Location</h3>
        <p class="muted small">${loc ? `Currently set to <strong>${escapeHtml(loc.label)}</strong>${loc.source === 'detected' ? ' (detected)' : ''}.` : 'No location set yet.'}</p>
        <button class="btn btn--secondary" data-change-loc>${icon('pin', 15)} Change location</button>
      </div>

      <div class="card profile-card" style="margin-top:var(--space-4)">
        <h3 style="font-family:var(--font-body); font-size:var(--text-base); font-weight:700">Reset app data</h3>
        <p class="muted small">Clears your profile, location, bookings and reviews from this device. Useful when demonstrating the app from a clean state.</p>
        <button class="btn btn--danger" data-clear>Clear all my data</button>
      </div>
    </div>
  </div>`;

  const form = app.querySelector('[data-profile-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = { name: form.name.value, phone: form.phone.value, email: form.email.value };
    const errors = validate(values);
    let ok = true;
    for (const f of ['name', 'phone', 'email']) {
      const wrap = form.querySelector(`[data-field="${f}"]`);
      const errEl = wrap.querySelector('.field-error');
      if (errors[f]) {
        wrap.classList.add('field--invalid');
        errEl.innerHTML = `${icon('alert', 13)} ${escapeHtml(errors[f])}`;
        errEl.hidden = false;
        ok = false;
      } else {
        wrap.classList.remove('field--invalid');
        errEl.hidden = true;
      }
    }
    if (!ok) { showToast('Please fix the highlighted fields.', 'error'); return; }
    store.set('user', { ...store.get('user'), ...values });
    showToast('Profile saved. Bookings will be prefilled with these details.');
    renderProfile(app); // refresh header/avatar
  });

  app.querySelector('[data-change-loc]').addEventListener('click', () => openLocationModal());

  app.querySelector('[data-clear]').addEventListener('click', () =>
    confirmModal({
      title: 'Clear all data?',
      text: 'This removes your profile, location, appointments and submitted reviews from this browser. The app returns to a fresh state.',
      confirmLabel: 'Clear everything',
      onConfirm: () => {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('velora.'))
          .forEach((k) => localStorage.removeItem(k));
        location.reload();
      },
    })
  );
}
