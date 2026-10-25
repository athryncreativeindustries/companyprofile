/* ==========================================================
   ATHRYN CREATIVE INDUSTRIES — script.js
   1. JS flag  2. Navbar (scroll, mobile menu, a11y, scrollspy)
   3. Reveal on scroll  4. Portfolio filter
   ========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- NAVBAR ---------- */
  function initNavbar() {
    var header = document.getElementById('site-header');
    var toggle = document.getElementById('navbar-toggle');
    var menu = document.getElementById('navbar-menu');
    if (!header || !toggle || !menu) return;

    var links = menu.querySelectorAll('.navbar__link');
    var cta = menu.querySelector('.navbar__cta');
    var behind = document.querySelectorAll('main, .site-footer, .back-to-top'); // di-inert saat menu mobile terbuka
    var MOBILE_BP = 900;
    var DELTA = 8;            // minimal scroll supaya dianggap arah baru
    var lastY = window.scrollY;
    var ticking = false;

    function isMenuOpen() { return menu.classList.contains('is-open'); }

    /* Mobile menu */
    function setMenu(open) {
      menu.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

      behind.forEach(function (el) {
        if (open) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });

      if (open) {
        header.classList.remove('is-hidden');
        setTimeout(function () { if (isMenuOpen()) links[0].focus(); }, 60);
      }
    }

    toggle.addEventListener('click', function () { setMenu(!isMenuOpen()); });

    links.forEach(function (link) {
      link.addEventListener('click', function () { if (isMenuOpen()) setMenu(false); });
    });
    if (cta) cta.addEventListener('click', function () { if (isMenuOpen()) setMenu(false); });

    document.addEventListener('keydown', function (e) {
      if (!isMenuOpen()) return;

      if (e.key === 'Escape') {
        setMenu(false);
        toggle.focus();
        return;
      }

      // Focus trap sederhana di dalam menu mobile
      if (e.key === 'Tab') {
        var focusables = header.querySelectorAll('a[href], button');
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > MOBILE_BP && isMenuOpen()) setMenu(false);
    });

    /* Scroll behavior: transparent at top, hide on down, show on up */
    function update() {
      var y = Math.max(window.scrollY, 0);

      header.classList.toggle('is-scrolled', y > 10);

      if (!isMenuOpen()) {
        if (y <= 10) {
          header.classList.remove('is-hidden');
        } else if (y > lastY + DELTA && y > 120) {
          header.classList.add('is-hidden');
        } else if (y < lastY - DELTA) {
          header.classList.remove('is-hidden');
        }
      }

      if (Math.abs(y - lastY) > DELTA || y <= 10) lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    // Keyboard user tab ke navbar saat hidden -> munculkan
    header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

    update();

    /* Scrollspy: tandai link aktif; kosongkan kalau section aktif tidak ada di navbar */
    if ('IntersectionObserver' in window) {
      var map = {};
      links.forEach(function (link) {
        var id = link.getAttribute('href').slice(1);
        if (document.getElementById(id)) map[id] = link;
      });

      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('is-active'); });
          if (map[entry.target.id]) map[entry.target.id].classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

      document.querySelectorAll('main > section[id]').forEach(function (section) {
        spy.observe(section);
      });
    }
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- PORTFOLIO FILTER ---------- */
  /* ---------- PORTFOLIO FILTER (animated) ---------- */
  function initPortfolioFilter() {
    var buttons = document.querySelectorAll('.portfolio__filter');
    var grid = document.querySelector('.portfolio__grid');
    var items = Array.prototype.slice.call(document.querySelectorAll('.portfolio__item'));
    if (!buttons.length || !grid || !items.length) return;

    var canAnimate = typeof Element.prototype.animate === 'function' &&
      !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    var timer = null;
    var pending = null;
    var running = [];

    function matches(el, cat) {
      return cat === 'all' || el.getAttribute('data-category') === cat;
    }
    function pageRect(el) {
      var r = el.getBoundingClientRect();
      return { left: r.left + window.pageXOffset, top: r.top + window.pageYOffset };
    }
    function play(el, keyframes, options) {
      var a = el.animate(keyframes, options);
      running.push(a);
      return a;
    }
    function cancelRunning() {
      running.forEach(function (a) { a.cancel(); });
      running = [];
    }

    // Selesaikan animasi sebelumnya kalau user klik filter lagi di tengah jalan
    function flush() {
      clearTimeout(timer);
      if (pending) {
        var fn = pending;
        pending = null;
        fn();
      }
      cancelRunning();
    }

    function filter(cat) {
      flush();

      var show = items.filter(function (el) { return matches(el, cat); });
      var hide = items.filter(function (el) { return !matches(el, cat); });

      if (!canAnimate) {
        items.forEach(function (el) { el.hidden = !matches(el, cat); });
        return;
      }

      // FIRST: posisi dan tinggi sebelum perubahan
      var first = new Map();
      items.forEach(function (el) { if (!el.hidden) first.set(el, pageRect(el)); });
      var h0 = grid.offsetHeight;

      // Kartu yang keluar: fade + mengecil
      var leaving = hide.filter(function (el) { return !el.hidden; });
      leaving.forEach(function (el) {
        play(el,
          [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.92)' }],
          { duration: 220, easing: 'ease', fill: 'forwards' });
      });

      function apply() {
        cancelRunning();
        hide.forEach(function (el) { el.hidden = true; });
        show.forEach(function (el) { el.classList.add('is-visible'); el.hidden = false; });

        var h1 = grid.offsetHeight;
        var n = 0;

        show.forEach(function (el) {
          var f = first.get(el);
          var last = pageRect(el);

          if (f) {
            // Kartu yang tetap tampil: geser dari posisi lama ke posisi baru
            var dx = f.left - last.left;
            var dy = f.top - last.top;
            if (dx || dy) {
              play(el,
                [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'translate(0,0)' }],
                { duration: 500, easing: EASE });
            }
          } else {
            // Kartu baru muncul: slide up + fade, berurutan
            play(el,
              [{ opacity: 0, transform: 'translateY(28px) scale(0.96)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' }],
              { duration: 500, delay: 80 + (n++) * 60, easing: EASE, fill: 'backwards' });
          }
        });

        // Tinggi grid berubah halus supaya konten di bawahnya nggak loncat
        if (h0 !== h1) {
          play(grid, [{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 500, easing: EASE });
        }
      }

      pending = apply;
      timer = setTimeout(function () {
        var fn = pending;
        pending = null;
        if (fn) fn();
      }, leaving.length ? 230 : 0);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-active')) return;

        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });

        filter(btn.getAttribute('data-filter'));
      });
    });
  }
  /* ---------- BACK TO TOP ---------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    var ticking = false;
    function toggleBtn() {
      btn.classList.toggle('is-visible', window.scrollY > 600);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(toggleBtn);
        ticking = true;
      }
    }, { passive: true });

    toggleBtn();
  }
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initReveal();
    initClients();
    initPortfolioFilter();
    initBackToTop();
  });
  /* ---------- CLIENTS CAROUSEL ---------- */
  function initClients() {
    var viewport = document.getElementById('clients-viewport');
    var track = document.getElementById('clients-track');
    var toggle = document.getElementById('clients-toggle');
    if (!viewport || !track) return;

    // Hormati reduced motion: biarkan barisan statis
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    function cloneSet(list) {
      list.forEach(function (el) {
        var c = el.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        track.appendChild(c);
      });
    }

    viewport.classList.add('is-marquee');

    // Isi sampai satu grup lebih lebar dari layar (kalau logo sedikit)
    var guard = 0;
    while (track.scrollWidth < viewport.clientWidth && guard++ < 10) cloneSet(originals);

    // Gandakan seluruh grup sekali untuk loop mulus (translateX -50%)
    var group = Array.prototype.slice.call(track.children);
    cloneSet(group);
    track.style.setProperty('--marquee-duration', Math.max(20, group.length * 4) + 's');

    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        var paused = viewport.classList.toggle('is-paused');
        toggle.textContent = paused ? 'Play' : 'Pause';
        toggle.setAttribute('aria-label', paused ? 'Play client logos scrolling' : 'Pause client logos scrolling');
      });
    }
  }

})();