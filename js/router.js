/* ============================================================
   ROUTER — maps the URL hash to a page renderer (Controller).
   Hash-based so it works from any static file server without
   server-side configuration.
   ============================================================ */

import { parseHash } from './utils.js';
import { setActiveNav } from './components.js';

const routes = [];

export function route(pattern, render) {
  // pattern like '/service/:id' -> regex + param names
  const names = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:[^/]+/g, (m) => { names.push(m.slice(1)); return '([^/]+)'; }) + '$'
  );
  routes.push({ regex, names, render });
}

export function navigate(hash) {
  if (location.hash === hash) handleRoute();
  else location.hash = hash;
}

function handleRoute() {
  const { path, params } = parseHash(location.hash);
  const app = document.getElementById('app');

  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      r.names.forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]); });
      app.innerHTML = '';
      r.render(app, params);
      setActiveNav(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
  }

  // Unknown route -> friendly not-found state
  app.innerHTML = `
    <div class="container" style="padding-block: var(--space-8); text-align:center; max-width:480px">
      <h1 style="font-size:var(--text-2xl)">Page not found</h1>
      <p class="muted">The link you followed doesn\u2019t exist. Let\u2019s get you back on track.</p>
      <a class="btn btn--primary" href="#/">Back to home</a>
    </div>`;
  setActiveNav('');
}

export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
