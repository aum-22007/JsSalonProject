/* ============================================================
   TIME SLOTS — generates available appointment slots for a date.
   Slots are derived from the salon's opening hours; a seeded
   pseudo-random function marks some as already booked so the
   schedule looks realistic but stays stable per date.
   ============================================================ */

import { SALON } from './data.js';
import { parseDate, todayStr, seededRandom } from './utils.js';
import { store } from './store.js';

const SLOT_MINUTES = 30;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(mins) {
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

export function hoursFor(dateStr) {
  return SALON.openingHours[parseDate(dateStr).getDay()];
}

export function isClosedOn(dateStr) {
  return !!hoursFor(dateStr).closed;
}

/**
 * Returns [{ time:'10:30', available:true }, ...] for a date,
 * or null when the salon is closed that day.
 */
export function generateSlots(dateStr, serviceDuration = 30) {
  const hours = hoursFor(dateStr);
  if (hours.closed) return null;

  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const lastStart = close - Math.max(serviceDuration, SLOT_MINUTES);

  // Slots already taken by this user's own upcoming appointments
  const mine = new Set(
    store.get('appointments')
      .filter((a) => a.status === 'upcoming' && a.date === dateStr)
      .map((a) => a.time)
  );

  const isToday = dateStr === todayStr();
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let t = open; t <= lastStart; t += SLOT_MINUTES) {
    const time = toHHMM(t);
    // Deterministic "already booked by someone else" — ~35% of slots
    const takenByOthers = seededRandom(`${dateStr}-${time}`) < 0.35;
    const inPast = isToday && t <= nowMins + 30; // need 30 min notice
    slots.push({ time, available: !takenByOthers && !inPast && !mine.has(time) });
  }
  return slots;
}

/** Next `count` calendar days starting today. */
export function upcomingDates(count = 14) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    out.push({
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dow: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dom: d.getDate(),
      mon: d.toLocaleDateString('en-IN', { month: 'short' }),
      closed: !!SALON.openingHours[d.getDay()].closed,
    });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Is the salon open right now? Used for the "Open now" badge. */
export function openNowInfo() {
  const now = new Date();
  const hours = SALON.openingHours[now.getDay()];
  if (hours.closed) return { open: false, label: 'Closed today' };
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins < toMinutes(hours.open)) return { open: false, label: `Opens at ${hours.open}` };
  if (mins >= toMinutes(hours.close)) return { open: false, label: 'Closed now' };
  return { open: true, label: `Open now \u00b7 till ${hours.close}` };
}
