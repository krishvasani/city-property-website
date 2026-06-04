/* City Property Services — effortless page transitions.
   Crossfade out on navigation, fade/rise in on arrival. Dependency-free.
   Reveal is guaranteed by an inline <head> failsafe; this file owns the
   exit animation and intercepts internal links. */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Navigate with a soft fade-out (used by links AND card onclick handlers).
  function leaveTo(href) {
    if (!href) return;
    if (reduce) { window.location.href = href; return; }
    document.body.classList.remove('pt-ready');
    document.body.classList.add('pt-leaving');
    window.setTimeout(function () { window.location.href = href; }, 250);
  }
  window.cpsNav = leaveTo;

  if (reduce) return;

  // Restore visible state when returning via back/forward (bfcache).
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('pt-leaving');
      document.body.classList.add('pt-ready');
    }
  });

  // Intercept same-origin link clicks for the fade-out.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (a.target && a.target !== '' && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;

    let url;
    try { url = new URL(a.href, window.location.href); } catch (_) { return; }
    if (url.origin !== window.location.origin) return;
    // pure in-page anchor → let the browser handle the smooth scroll
    if (url.pathname === window.location.pathname && url.hash) return;

    e.preventDefault();
    leaveTo(a.href);
  });
})();
