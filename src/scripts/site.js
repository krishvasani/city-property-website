/* City Property Services — shared interactions */
(function () {
  // Favorite toggles
  document.addEventListener('click', function (e) {
    const fav = e.target.closest('.prop-fav');
    if (fav) {
      e.preventDefault(); e.stopPropagation();
      fav.classList.toggle('is-on');
      const on = fav.classList.contains('is-on');
      const svg = fav.querySelector('svg');
      if (svg) { svg.setAttribute('fill', on ? 'currentColor' : 'none'); svg.setAttribute('stroke', on ? 'none' : 'currentColor'); }
    }
  });

  // Single-select groups (data-single on container; toggles .is-active on .chip/button children)
  document.querySelectorAll('[data-single]').forEach(function (c) {
    const sel = c.getAttribute('data-single') || '.chip';
    c.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('click', function () {
        c.querySelectorAll(sel).forEach(x => x.classList.remove('is-active'));
        el.classList.add('is-active');
      });
    });
  });

  // Multi-toggle groups
  document.querySelectorAll('[data-multi]').forEach(function (c) {
    const sel = c.getAttribute('data-multi') || '.chip';
    c.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('click', () => el.classList.toggle('is-active'));
    });
  });

  // Map pins single-select
  document.querySelectorAll('.map').forEach(function (m) {
    m.querySelectorAll('.map-pin').forEach(function (p) {
      p.addEventListener('click', function () {
        m.querySelectorAll('.map-pin').forEach(x => x.classList.remove('is-active'));
        p.classList.add('is-active');
      });
    });
  });

  // Nav elevation on scroll
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Reveal handled by motion.js (Motion lib). Safety net: if motion.js never
  // marks itself ready (e.g. CDN blocked), force-show all reveals so nothing
  // stays invisible.
  setTimeout(function () {
    if (!window.__motionReady) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    }
  }, 1800);

  // 3D pointer tilt — pure vanilla, no dependency. Tag cards & tiles, then track.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    document.querySelectorAll('.prop, .type-tile').forEach(el => el.classList.add('tilt'));
    const MAX = 7;
    document.querySelectorAll('.tilt').forEach(function (card) {
      let raf = 0;
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.setProperty('--rx', (-py * MAX).toFixed(2) + 'deg');
          card.style.setProperty('--ry', (px * MAX).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (px * 90 + 50).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 90 + 50).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
