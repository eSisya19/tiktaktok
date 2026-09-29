(function () {
  'use strict';
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- iPhone tutorial ---------- */
  var demo = document.querySelector('.demo');
  if (demo) {
    var phone = demo.querySelector('.iphone');
    var scenes = [].slice.call(demo.querySelectorAll('.m-scene'));
    var steps = [].slice.call(demo.querySelectorAll('.demo-step'));
    var toggle = demo.querySelector('.demo-toggle');
    var DUR = 5400, index = 0, timer = null, inView = !hasIO, userPaused = reduce;

    demo.style.setProperty('--m-dur', DUR / 1000 + 's');

    var restart = function (el) { el.classList.remove('is-active'); void el.offsetWidth; el.classList.add('is-active'); };

    var show = function (n) {
      index = (n + scenes.length) % scenes.length;
      scenes.forEach(function (s, k) { if (k !== index) s.classList.remove('is-active'); });
      steps.forEach(function (b, k) {
        b.setAttribute('aria-pressed', k === index ? 'true' : 'false');
        if (k !== index) b.classList.remove('is-active');
      });
      restart(scenes[index]);
      if (steps[index]) restart(steps[index]);
      phone.setAttribute('data-scene', String(index));
    };

    var schedule = function () {
      clearTimeout(timer);
      var running = !userPaused && inView && !document.hidden;
      demo.classList.toggle('is-paused', !running);
      if (running) timer = setTimeout(function () { show(index + 1); schedule(); }, DUR);
    };

    steps.forEach(function (b, k) {
      b.addEventListener('click', function () {
        show(k); schedule();
        var r = phone.getBoundingClientRect();
        if (r.top < 60 || r.bottom > window.innerHeight) {
          phone.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        }
      });
    });

    if (toggle) {
      var syncToggle = function () {
        toggle.textContent = userPaused ? 'Play animation' : 'Pause animation';
        toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      };
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        if (!userPaused) show(index);
        syncToggle(); schedule();
      });
      syncToggle();
    }

    if (hasIO) {
      new IntersectionObserver(function (entries) {
                inView = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.25 }).observe(phone);
    }
    document.addEventListener('visibilitychange', schedule);
    show(0);
    schedule();
  }

  if (reduce || !hasIO) return;

  /* ---------- scroll reveals ---------- */
  document.documentElement.classList.add('js-motion');
  var targets = document.querySelectorAll('article section > h2, article section > .section-intro, .note, .m-about, .card, #start ol li, #faq details, .trust, .demo-head, .final-cta');
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  [].forEach.call(targets, function (el) {
    var sibs = el.parentNode ? [].filter.call(el.parentNode.children, function (c) { return c.tagName === el.tagName; }) : [];
    var i = Math.max(0, sibs.indexOf(el));
    el.style.setProperty('--rv-d', Math.min(i, 6) * 0.08 + 's');
    el.classList.add('rv');
    revealer.observe(el);
  });

  /* ---------- pause looping illustrations when off-screen ---------- */
  var loopers = document.querySelectorAll('.m-mini, .m-about, .e2e, .final-cta');
  var pauser = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('m-paused', !e.isIntersecting); });
  });
  [].forEach.call(loopers, function (el) { pauser.observe(el); });
})();
