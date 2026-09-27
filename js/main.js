(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  const menuLinks = [...menu.querySelectorAll('a')];
  const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    if (restoreFocus) toggle.focus();
  };

  const openMenu = () => {
    body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    window.setTimeout(() => menuLinks[0].focus(), 380);
  };

  toggle.addEventListener('click', () => body.classList.contains('menu-open') ? closeMenu() : openMenu());
  menuLinks.forEach(link => link.addEventListener('click', () => closeMenu({ restoreFocus: false })));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) {
      closeMenu();
      return;
    }
    if (event.key !== 'Tab' || !body.classList.contains('menu-open')) return;
    const focusable = [toggle, ...menuLinks];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu({ restoreFocus: false });
  });

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (mediaReduced.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...document.querySelectorAll('.nav-links a')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -60%', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  const cursorLight = document.querySelector('.cursor-light');
  if (cursorLight && window.matchMedia('(pointer: fine)').matches && !mediaReduced.matches) {
    let rafId = 0;
    window.addEventListener('pointermove', event => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        cursorLight.style.setProperty('--x', `${event.clientX}px`);
        cursorLight.style.setProperty('--y', `${event.clientY}px`);
        cursorLight.classList.add('visible');
        rafId = 0;
      });
    }, { passive: true });
  }

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
