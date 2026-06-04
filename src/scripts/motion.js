/* City Property Services — Motion enhancements (self-contained)
   Scroll-reveals, staggered grids, count-ups, and hero parallax.
   Pure IntersectionObserver + CSS transitions + rAF — no external deps,
   so it's reliable everywhere. Honors prefers-reduced-motion. */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__motionReady = true;
  document.documentElement.classList.add('motion-ready');
  const inr = (n) => Math.round(n).toLocaleString('en-IN');

  if (reduce) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    document.querySelectorAll('[data-stagger]').forEach(g =>
      Array.from(g.children).forEach(k => k.classList.add('in')));
    document.querySelectorAll('[data-count]').forEach(setFinal);
    return;
  }

  function setFinal(el) {
    const t = parseFloat(el.getAttribute('data-count'));
    const s = el.getAttribute('data-suffix') || '';
    const d = parseInt(el.getAttribute('data-dec') || '0', 10);
    el.textContent = (d ? t.toFixed(d) : inr(t)) + s;
  }

  // Prepare staggered children: hide + assign incremental transition delays
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.from(group.children).forEach(function (child, i) {
      child.classList.add('stagger-item');
      child.style.transitionDelay = (i * 70) + 'ms';
    });
  });

  // Single observer for reveals + stagger groups
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.hasAttribute('data-stagger')) {
        const kids = Array.from(el.children);
        kids.forEach(c => c.classList.add('in'));
        // After the entrance settles, release the stagger styling so the CSS
        // 3D tilt rule can govern transform cleanly (no leftover override).
        const maxDelay = (kids.length - 1) * 70 + 750;
        setTimeout(function () {
          kids.forEach(c => { c.classList.remove('stagger-item', 'in'); c.style.transitionDelay = ''; });
        }, maxDelay + 60);
      } else {
        el.classList.add('in');
      }
      io.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  document.querySelectorAll('[data-stagger]').forEach(el => io.observe(el));

  // Count-ups
  const countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      const el = en.target;
      countIO.unobserve(el);
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      const fmt = v => (dec ? v.toFixed(dec) : inr(v)) + suffix;
      const dur = 1300, t0 = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      (function step(now) {
        const t = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(target * ease(t));
        if (t < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
      })(t0);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    const d = parseInt(el.getAttribute('data-dec') || '0', 10);
    el.textContent = (d ? (0).toFixed(d) : '0') + (el.getAttribute('data-suffix') || '');
    countIO.observe(el);
  });

  // Hero parallax — gentle drift + scale as it scrolls
  const art = document.querySelector('[data-parallax]');
  if (art) {
    let raf = 0;
    const onScroll = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        const r = art.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
        art.style.setProperty('--py', (p * 40 - 8).toFixed(1) + 'px');
        art.style.setProperty('--ps', (1 + p * 0.04).toFixed(3));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
