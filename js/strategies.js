/* ============================================================
   STRATEGY PATTERN
   Interchangeable behaviours for filtering, sorting and
   validation. Each strategy is a small pure function with the
   same signature, so UI code can swap them without if/else
   chains spread everywhere.
   ============================================================ */

/* ---------- Filtering strategies ----------
   Each: (service, value) -> boolean. A service must pass every
   active strategy to appear in results. */
export const filterStrategies = {
  search(service, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      service.name.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q)
    );
  },
  category(service, categoryId) {
    return !categoryId || service.category === categoryId;
  },
  maxPrice(service, max) {
    return !max || service.price <= max;
  },
  minRating(service, min) {
    return !min || service.rating >= min;
  },
  maxDuration(service, max) {
    return !max || service.duration <= max;
  },
};

/** Apply every strategy whose key appears in `criteria`. */
export function applyFilters(services, criteria) {
  return services.filter((service) =>
    Object.entries(criteria).every(([key, value]) => {
      const strategy = filterStrategies[key];
      return strategy ? strategy(service, value) : true;
    })
  );
}

/* ---------- Sorting strategies ----------
   Each: comparator (a, b) -> number, used directly by Array.sort. */
export const sortStrategies = {
  recommended: (a, b) => (b.popular - a.popular) || (b.rating - a.rating),
  priceLow: (a, b) => a.price - b.price,
  priceHigh: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  quickest: (a, b) => a.duration - b.duration,
};

export const SORT_LABELS = {
  recommended: 'Recommended',
  priceLow: 'Price: low to high',
  priceHigh: 'Price: high to low',
  rating: 'Highest rated',
  quickest: 'Shortest duration',
};

export function applySort(services, key) {
  const strategy = sortStrategies[key] || sortStrategies.recommended;
  return [...services].sort(strategy);
}

/* ---------- Validation strategies ----------
   Each: (value) -> error message string, or '' when valid. */
export const validators = {
  name(value) {
    if (!value.trim()) return 'Please enter your name so we know who the booking is for.';
    if (value.trim().length < 3) return 'Name looks too short — please enter your full name.';
    return '';
  },
  phone(value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'A phone number is needed to confirm your appointment.';
    if (!/^(91)?[6-9]\d{9}$/.test(digits)) return 'Enter a valid 10-digit Indian mobile number.';
    return '';
  },
  email(value) {
    if (!value.trim()) return ''; // email is optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'This email address doesn\u2019t look right — check for typos.';
    return '';
  },
  review(value) {
    if (!value.trim()) return 'Please write a line or two about your experience.';
    if (value.trim().length < 10) return 'A little more detail helps others — at least 10 characters.';
    return '';
  },
};

/** Validate {field: value} against matching validators. Returns {field: errorMsg}. */
export function validate(values) {
  const errors = {};
  for (const [field, value] of Object.entries(values)) {
    const strategy = validators[field];
    if (strategy) {
      const msg = strategy(value ?? '');
      if (msg) errors[field] = msg;
    }
  }
  return errors;
}
