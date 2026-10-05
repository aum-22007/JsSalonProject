/* ============================================================
   BOOKING CONFIRMATION PAGE
   ============================================================ */

import { SALON, getService } from '../data.js';
import { getAppointment } from '../store.js';
import { icon, statusBadge, emptyStateHtml, showToast } from '../components.js';
import { formatINR, formatDuration, formatDate, formatTime, escapeHtml } from '../utils.js';

export function renderConfirmation(app, params) {
  const appt = getAppointment(params.id);

  if (!appt) {
    app.innerHTML = `
    <div class="container" style="padding-block:var(--space-8); max-width:520px">
      ${emptyStateHtml({
        iconName: 'alert',
        title: 'Booking not found',
        text: 'We couldn\u2019t find this booking on this device. Check “My Bookings” for your appointments.',
        actionHtml: '<a class="btn btn--primary" href="#/appointments">Go to My Bookings</a>',
      })}
    </div>`;
    return;
  }

  const service = getService(appt.serviceId);

  app.innerHTML = `
  <div class="container confirm-wrap">
    <div class="confirm-tick">${icon('check', 32)}</div>
    <h1 style="font-size:var(--text-2xl)">Booking confirmed</h1>
    <p class="muted">You\u2019re all set, ${escapeHtml(appt.customer.name.split(' ')[0])}. We\u2019ve reserved your chair — just show the booking ID at the reception.</p>

    <div class="card confirm-card">
      <div class="confirm-card-head">
        <span class="bk-id">Booking ID: ${appt.appointmentId}</span>
        ${statusBadge(appt.status)}
      </div>
      <div class="confirm-card-body">
        <div class="summary-row"><span class="label">Salon</span><span class="value">${SALON.name}, ${escapeHtml(SALON.area)}</span></div>
        <div class="summary-row"><span class="label">Service</span><span class="value">${escapeHtml(service.name)} · ${formatDuration(service.duration)}</span></div>
        <div class="summary-row"><span class="label">Date</span><span class="value">${formatDate(appt.date)}</span></div>
        <div class="summary-row"><span class="label">Time</span><span class="value">${formatTime(appt.time)}</span></div>
        <div class="summary-row"><span class="label">Booked for</span><span class="value">${escapeHtml(appt.customer.name)} · ${escapeHtml(appt.customer.phone)}</span></div>
        <div class="summary-row summary-total"><span class="label">To pay at salon</span><span class="value">${formatINR(service.price)}</span></div>
      </div>
    </div>

    <div class="instructions">
      <strong>Before you come</strong>
      <ul>
        <li>Arrive 10 minutes early — your slot is held for 15 minutes.</li>
        <li>Payment is at the counter after your service: cash, UPI or card.</li>
        <li>Need to cancel? Do it free of charge up to 2 hours before, from “My Bookings”.</li>
      </ul>
    </div>

    <div class="confirm-actions">
      <button class="btn btn--secondary" data-ics>${icon('download', 15)} Add to calendar</button>
      <a class="btn btn--secondary" href="#/appointments">${icon('calendar', 15)} View my bookings</a>
      <a class="btn btn--primary" href="#/">Back to home</a>
    </div>
  </div>`;

  app.querySelector('[data-ics]').addEventListener('click', () => {
    downloadIcs(appt, service);
    showToast('Calendar file downloaded — open it to add the event.');
  });
}

/** Builds a minimal .ics file so the appointment can be added to any calendar app. */
function downloadIcs(appt, service) {
  const start = new Date(`${appt.date}T${appt.time}:00`);
  const end = new Date(start.getTime() + service.duration * 60000);
  const fmt = (d) =>
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + 'T' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') + '00';
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Velora Studio//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${appt.appointmentId}@velorastudio.in`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${service.name} — Velora Studio`,
    `DESCRIPTION:Booking ID ${appt.appointmentId}. Pay \u20B9${service.price} at the salon.`,
    `LOCATION:${SALON.location}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `velora-booking-${appt.appointmentId}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}
