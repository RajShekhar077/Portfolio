(() => {
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const EMAIL = 'rajshekhar77707@gmail.com';

  /* toast */
  const toast = $('.toast');
  let toastTimer;
  const say = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  /* theme toggle (remembered between visits) */
  const themeBtn = $('#theme');
  const applyTheme = t => {
    root.dataset.theme = t;
    themeBtn.textContent = t === 'dark' ? '☾' : '☀';
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    $('meta[name="theme-color"]').content = t === 'dark' ? '#09090b' : '#f6f6f8';
  };
  applyTheme(root.dataset.theme || 'dark');
  themeBtn.addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(t);
    try { localStorage.setItem('theme', t); } catch (e) {}
  });

  /* mobile menu */
  const menu = $('.menu-toggle'), links = $('.nav-links');
  const setMenu = open => {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '✕' : '☰';
  };
  menu.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  d.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false); });

  /* scroll progress + back to top */
  const bar = $('.progress'), toTop = $('.to-top');
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    toTop.classList.toggle('show', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* active nav link */
  const navLinks = $$('.nav-links a[href^="#"]');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'about', 'skills', 'projects', 'coding', 'contact'].forEach(id => {
    const el = d.getElementById(id);
    if (el) spy.observe(el);
  });

  /* hero: code window lines appear one by one */
  $$('.editor .l').forEach((l, i) => l.style.setProperty('--i', i));

  /* hero: typing effect */
  const typed = $('#typed');
  const words = ['C++ & Data Structures', 'web development', 'problem solving', 'building real projects'];
  if (!reduce) {
    let w = 0, c = 0, deleting = false;
    (function tick() {
      const word = words[w];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 70;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    })();
  }

  /* scroll reveal with small stagger between siblings */
  const revealEls = $$('.section h2, .intro, .about-content > *, .skill-list .row, .project, .link-rows a, .stat, .contact > *');
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealer.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => {
    el.classList.add('reveal');
    el.style.setProperty('--d', Math.min([...el.parentElement.children].indexOf(el), 5) * 0.08 + 's');
    revealer.observe(el);
  });

  /* count-up numbers */
  const counter = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counter.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = end + suffix; return; }
      const start = performance.now();
      (function frame(now) {
        const p = Math.min((now - start) / 1200, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      })(start);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => counter.observe(el));

  /* cursor glow + card spotlight (mouse devices only) */
  if (finePointer && !reduce) {
    const glow = $('.cursor-glow');
    addEventListener('pointermove', e => {
      glow.style.opacity = 1;
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
    $$('.project, .link-rows a').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  }

  /* contact: copy email + mailto form */
  $('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); say('Email copied'); }
    catch (e) { say(EMAIL); }
  });
  $('.contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = 'Portfolio message from ' + f.get('name');
    const body = `${f.get('message')}\n\n${f.get('name')} (${f.get('email')})`;
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say('Opening your email app');
    e.target.reset();
  });
})();
