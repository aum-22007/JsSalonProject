/* ============================================================
   STORE — Observer pattern
   A tiny publish/subscribe state container. Pages and components
   subscribe to keys they care about; when a value changes, every
   subscriber is notified and re-renders just its own UI.

   Persisted keys are mirrored to localStorage so appointments,
   reviews, profile and location survive a page refresh.
   ============================================================ */

import { SEED_REVIEWS } from './data.js';
import { todayStr } from './utils.js';

const PERSIST_PREFIX = 'velora.';
const PERSISTED_KEYS = ['location', 'user', 'appointments', 'reviews'];

class Store {
  #state = {};
  #listeners = {}; // key -> Set<fn>

  constructor(initial) {
    this.#state = { ...initial };
  }

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    this.#state[key] = value;
    if (PERSISTED_KEYS.includes(key)) {
      try {
        localStorage.setItem(PERSIST_PREFIX + key, JSON.stringify(value));
      } catch { /* storage unavailable — app still works in memory */ }
    }
    (this.#listeners[key] || []).forEach((fn) => fn(value));
  }

  /** Observer pattern: subscribe to changes of one key. Returns unsubscribe fn. */
  subscribe(key, fn) {
    (this.#listeners[key] ||= new Set()).add(fn);
    return () => this.#listeners[key].delete(fn);
  }
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PERSIST_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ---- Seed data on first visit -------------------------------------
   One completed past appointment is seeded so the "leave a review"
   flow can be demonstrated without waiting for a real appointment
   date to pass. */
function seedAppointments() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  const past = d.toISOString().slice(0, 10);
  return [{
    appointmentId: 'VS-58214',
    serviceId: 's8',
    date: past,
    time: '11:30',
    status: 'completed',
    reviewed: false,
    customer: { name: 'Guest User', email: '', phone: '' },
    createdAt: Date.now() - 6 * 24 * 3600 * 1000,
  }];
}

/* Appointments whose date/time has passed become "completed". */
function reconcileStatuses(appointments) {
  const now = new Date();
  return appointments.map((a) => {
    if (a.status !== 'upcoming') return a;
    const dt = new Date(`${a.date}T${a.time}:00`);
    dt.setMinutes(dt.getMinutes() + 90); // grace period after start
    return dt < now ? { ...a, status: 'completed' } : a;
  });
}

export const store = new Store({
  location: load('location', null),
  user: load('user', null),
  appointments: reconcileStatuses(load('appointments', seedAppointments())),
  reviews: load('reviews', SEED_REVIEWS),
  bookingDraft: null, // in-memory only: preserves input while navigating
});

/* ---- Convenience actions (the "Controller" side of MVC) ---- */

export function addAppointment(appt) {
  store.set('appointments', [appt, ...store.get('appointments')]);
}

export function updateAppointment(id, patch) {
  store.set(
    'appointments',
    store.get('appointments').map((a) => (a.appointmentId === id ? { ...a, ...patch } : a))
  );
}

export function getAppointment(id) {
  return store.get('appointments').find((a) => a.appointmentId === id) || null;
}

export function addReview(review) {
  store.set('reviews', [{ ...review, date: todayStr() }, ...store.get('reviews')]);
}

export function makeBookingId() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `VS-${n}`;
}
