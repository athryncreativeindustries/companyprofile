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
  function initPortfolioFilter() {
    var buttons = document.querySelectorAll('.portfolio__filter');
    var items = document.querySelectorAll('.portfolio__item');
    if (!buttons.length || !items.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-filter');

        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });

        items.forEach(function (item) {
          var match = category === 'all' || item.getAttribute('data-category') === category;
          item.hidden = !match;
        });
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
    initPortfolioFilter();
    initBackToTop();
  });
})();