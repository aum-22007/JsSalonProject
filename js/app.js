/* ============================================================
   APP ENTRY POINT
   Wires routes to page renderers, renders the chrome (header,
   footer, bottom nav) and shows the location prompt on the
   very first visit.
   ============================================================ */

import { inject } from '@vercel/analytics';

import { store } from './store.js';
import { route, startRouter } from './router.js';
import { renderHeader, renderFooter, renderBottomNav, openLocationModal } from './components.js';

import { renderHome } from './pages/home.js';
import { renderServices } from './pages/services.js';
import { renderSalonProfile } from './pages/salonProfile.js';
import { renderServiceDetail } from './pages/serviceDetail.js';
import { renderBooking } from './pages/booking.js';
import { renderConfirmation } from './pages/confirmation.js';
import { renderAppointments } from './pages/appointments.js';
import { renderProfile } from './pages/profile.js';

/* Initialize Vercel Web Analytics */
inject();

/* Routes */
route('/', renderHome);
route('/services', renderServices);
route('/salon', renderSalonProfile);
route('/service/:id', renderServiceDetail);
route('/booking', renderBooking);
route('/confirmation/:id', renderConfirmation);
route('/appointments', renderAppointments);
route('/profile', renderProfile);

/* Chrome */
renderHeader();
renderFooter();
renderBottomNav();

/* Start */
startRouter();

/* First visit: ask for location (never a dead end — it can be
   dismissed, picked manually, or detected via the browser). */
if (!store.get('location')) {
  setTimeout(() => openLocationModal({ required: true }), 600);
}
