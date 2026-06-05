// Persistent favourites (localStorage). The ported site.js handles the visual
// heart toggle + stopPropagation on .prop-fav clicks; this module owns
// persistence and restores saved state on load.

const KEY = 'cps:saved';

export function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function isSaved(slug: string): boolean {
  return getSaved().includes(slug);
}

export function toggleSaved(slug: string): boolean {
  const list = getSaved();
  const i = list.indexOf(slug);
  if (i >= 0) list.splice(i, 1);
  else list.push(slug);
  localStorage.setItem(KEY, JSON.stringify(list));
  updateCounts();
  return list.includes(slug);
}

function updateCounts() {
  const n = getSaved().length;
  document.querySelectorAll<HTMLElement>('[data-saved-count]').forEach((el) => {
    el.textContent = n ? `Saved (${n})` : 'Saved';
  });
  // Wishlist badge + heart state in the nav
  document.querySelectorAll<HTMLElement>('[data-wish-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
    el.closest('.nav-wish')?.classList.toggle('has-saved', n > 0);
  });
}

function fillFav(btn: Element, on: boolean) {
  btn.classList.toggle('is-on', on);
  const svg = btn.querySelector('svg');
  if (svg) {
    svg.setAttribute('fill', on ? 'currentColor' : 'none');
    svg.setAttribute('stroke', on ? 'none' : 'currentColor');
  }
}

function init() {
  // Restore saved hearts on cards
  document.querySelectorAll('.prop-fav[data-fav]').forEach((btn) => {
    const slug = btn.getAttribute('data-fav');
    if (slug && isSaved(slug)) fillFav(btn, true);
  });
  // Persist on click (site.js performs the visual flip)
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.prop-fav[data-fav]');
    if (!btn) return;
    const slug = btn.getAttribute('data-fav');
    if (slug) toggleSaved(slug);
  });
  updateCounts();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
