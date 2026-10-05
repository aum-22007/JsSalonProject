# Velora Studio — Salon Management System

A single-salon, customer-facing booking web app built for a Web Development Workshop project.
Pure **HTML + CSS + JavaScript (ES modules)** — no frameworks, no build step, no dependencies.

## Run on

velora-seven-theta.vercel.app


## Customer workflow implemented

Open site → Select location (detect **or** manual, denial handled gracefully) → Home →
Browse categories/services → Search & filter → Salon profile (prices, photos, reviews,
amenities, hours) → Service details → Book (Service → Date & Time → Details → Confirm) →
Booking confirmed (ID, add-to-calendar) → Visit & **pay at the salon** → Leave a review,
which appears on the salon profile.

## Folder structure

```
index.html            app shell (header, main, footer, bottom-nav, modal/toast roots)
css/
  tokens.css          design tokens: colors, type scale, spacing, radii, shadows
  base.css            reset, typography, layout utilities
  components.css      buttons, cards, forms, nav, modal, toast, slots, steps…
  pages.css           per-page layouts (home, services, profile, booking…)
js/
  data.js             MODEL: salon, categories, services, seed reviews
  store.js            OBSERVER: pub/sub state container + localStorage persistence
  strategies.js       STRATEGY: filter / sort / validation strategies
  bookingFlow.js      STATE: booking wizard state machine
  slots.js            time-slot generation from opening hours
  router.js           hash router (CONTROLLER entry per page)
  components.js       VIEW: reusable render functions (cards, modal, toast, nav)
  utils.js            formatting helpers (₹, dates, times)
  pages/              one module per page (home, services, salonProfile,
                      serviceDetail, booking, confirmation, appointments, profile)
images/               generated salon imagery (consistent warm palette)
```

## Design patterns (and where they live)

| Pattern | File | Why it's used |
|---|---|---|
| **MVC (conceptual)** | `data.js` (M) · `components.js` + `pages/` (V) · event wiring in pages + `router.js` (C) | Keeps data, markup and interaction logic separable and explainable |
| **Observer** | `store.js` | Appointments list, nav location label etc. re-render automatically when state changes |
| **Strategy** | `strategies.js` | Filters, sort orders and form validators are swappable pure functions — no if/else webs |
| **State** | `bookingFlow.js` | The 4-step wizard can only move through valid transitions; invalid jumps are impossible |
| **Component-based UI** | `components.js` | ServiceCard, CategoryCard, ReviewCard, Modal, Toast, EmptyState, StatusBadge reused everywhere |

Deliberately **not** over-engineered: no factories where a function literal does the job,
no virtual DOM, no state library — `store.js` is ~60 lines.

## Data model

`User` (name, email, phone) · `Salon` (info, hours, amenities, rating) ·
`Service` (id, category, price ₹, duration, image, includes) ·
`Appointment` (id, serviceId, date, time, status: upcoming/completed/cancelled, customer) ·
`Review` (rating 1–5, comment, serviceName, date).

Appointments, reviews, profile and location persist in `localStorage`
(`Profile → Clear all my data` resets to a clean demo state).

## Notable behaviours

- **Location**: geolocation prompt with manual city search fallback — denial is never a dead end.
- **Slots**: generated from opening hours (closed Tuesdays), deterministic "already booked"
  pattern per date, past times blocked, 30-minute notice enforced.
- **Validation**: Indian mobile-number check, inline error messages that explain the fix.
- **Empty/error states**: no results, closed day, no slots, unknown route, unknown service,
  no reviews, no bookings — each with a next action.
- **A demo review flow**: one completed appointment is seeded so "Leave a review" can be
  shown immediately; the submitted review appears on the salon profile.
- **Accessibility**: semantic landmarks, labels, focus states, aria on tabs/steps/slots,
  status not conveyed by colour alone.
