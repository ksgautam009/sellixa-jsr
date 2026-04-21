/* ============================================================
   SELLIXA — script.js  (shadcn-enhanced edition)
   Features: particles, cursor glow, 3D tilt, magnetic btns,
   stat counters, FAQ accordion, pricing bars, carousel,
   HLS lazy-load, modal focus-trap, confetti popup
   ============================================================ */

'use strict';

// ─── UTILS ───────────────────────────────────────────────────
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
function lerp(a, b, n) { return a + (b - a) * n; }
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

// ─── PARTICLE CANVAS ─────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = window.innerWidth < 768 ? 25 : 55;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = Math.random() * (W || window.innerWidth);
      this.y  = initial ? Math.random() * (H || window.innerHeight) : -5;
      this.r  = Math.random() * 1.4 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = Math.random() * 0.25 + 0.08;
      this.alpha = Math.random() * 0.45 + 0.08;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > H + 5) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,196,0,${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });

    // Connect nearby particles with faint lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(245,196,0,${0.055 * (1 - d / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  init();
  loop();
  window.addEventListener('resize', debounce(init, 300));
})();

// ─── CURSOR GLOW ─────────────────────────────────────────────
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.innerWidth < 768) return;
  let mx = -300, my = -300, cx = -300, cy = -300;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function tick() {
    cx = lerp(cx, mx, 0.1);
    cy = lerp(cy, my, 0.1);
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();
})();

// ─── MAGNETIC BUTTONS ────────────────────────────────────────
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ─── 3D CARD TILT ────────────────────────────────────────────
// shadcn-inspired: subtle perspective tilt on creator/service cards
(function init3DTilt() {
  const cards = document.querySelectorAll('.creator-card, .service-card, .step-card, .testi-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      const rx  = clamp(y * -10, -8, 8);
      const ry  = clamp(x *  10, -8, 8);
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ─── NAVBAR SCROLL ───────────────────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── MOBILE MENU ─────────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', isOpen);
  const spans = menuToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
  }
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelectorAll('span').forEach(s => { s.style.transform = 'none'; s.style.opacity = '1'; });
  });
});

// ─── SCROLL REVEAL ───────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── HERO STAT COUNTERS ──────────────────────────────────────
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-num').forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start    = performance.now();
      (function tick(now) {
        const p    = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);
    });
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObserver.observe(heroStats);

// ─── CAROUSELS ───────────────────────────────────────────────
function initCarousel(trackId, dotsId) {
  const track         = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsId);
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let index = 0, autoTimer, startX = 0, isDragging = false;

  function getVisible() {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }
  function maxIndex() { return Math.max(0, total - getVisible()); }

  // shadcn pill-style dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'dot' + (i === index ? ' active' : '');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => { index = i; slide(); resetAuto(); });
      dotsContainer.appendChild(d);
    }
  }

  function slide() {
    const gap   = 20;
    const cardW = cards[0].offsetWidth + gap;
    track.style.transform = `translateX(-${index * cardW}px)`;
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  function next() { index = index >= maxIndex() ? 0 : index + 1; slide(); }
  function prev() { index = index <= 0 ? maxIndex() : index - 1; slide(); }

  // Arrow buttons
  document.querySelectorAll(`.carousel-btn[data-carousel="${trackId}"]`).forEach(btn => {
    if (btn.classList.contains('carousel-next')) btn.addEventListener('click', () => { next(); resetAuto(); });
    if (btn.classList.contains('carousel-prev')) btn.addEventListener('click', () => { prev(); resetAuto(); });
  });

  function startAuto() { autoTimer = setInterval(next, 4500); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  // Touch
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { dx > 0 ? prev() : next(); resetAuto(); }
  }, { passive: true });

  // Mouse drag
  track.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
  window.addEventListener('mouseup',  e => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) { dx > 0 ? prev() : next(); resetAuto(); }
  });

  // Hover pause
  const wrapper = track.closest('.carousel-wrapper');
  wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrapper.addEventListener('mouseleave', startAuto);

  // Keyboard
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  window.addEventListener('resize', debounce(() => {
    if (index > maxIndex()) index = maxIndex();
    buildDots();
    slide();
  }, 200));

  buildDots();
  slide();
  startAuto();
}

initCarousel('creatorsTrack', 'creatorsDots');
initCarousel('servicesTrack', 'servicesDots');

// ─── DONUT COUNTER ───────────────────────────────────────────
let counted = false;
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counted) {
      counted = true;
      const bigEl    = document.querySelector('.donut-center .big');
      const duration = 1500;
      const start    = performance.now();
      (function tick(now) {
        const p    = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        bigEl.textContent = Math.floor(ease * 75) + '%';
        if (p < 1) requestAnimationFrame(tick);
        else bigEl.textContent = '75%';
      })(start);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const donut = document.querySelector('.donut-chart');
if (donut) counterObserver.observe(donut);

// ─── HLS VIDEO (lazy-load) ───────────────────────────────────
const revenueVideo = document.getElementById('revenueVideo');
const hlsUrl = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
if (revenueVideo) {
  const videoObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        const hls = new Hls({ autoStartLoad: true, lowLatencyMode: false });
        hls.loadSource(hlsUrl);
        hls.attachMedia(revenueVideo);
        hls.on(Hls.Events.MANIFEST_PARSED, () => revenueVideo.play().catch(() => {}));
      } else if (revenueVideo.canPlayType('application/vnd.apple.mpegurl')) {
        revenueVideo.src = hlsUrl;
        revenueVideo.addEventListener('loadedmetadata', () => revenueVideo.play().catch(() => {}));
      }
      videoObserver.unobserve(revenueVideo);
    }
  }, { rootMargin: '400px' });
  videoObserver.observe(revenueVideo);
}

// ─── MODAL ───────────────────────────────────────────────────
const backdrop   = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
let lastFocusedEl = null;

function openModal() {
  lastFocusedEl = document.activeElement;
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const first = backdrop.querySelector('input, select, textarea, button');
    if (first) first.focus();
  }, 360);
}
function closeModal() {
  backdrop.classList.remove('active');
  document.body.style.overflow = '';
  if (lastFocusedEl) lastFocusedEl.focus();
}

document.querySelectorAll('.open-modal').forEach(btn => btn.addEventListener('click', openModal));
modalClose.addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

// Focus trap
backdrop.addEventListener('keydown', e => {
  if (!backdrop.classList.contains('active')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key !== 'Tab') return;
  const focusable = backdrop.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
  else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
});

// ─── SUPABASE ────────────────────────────────────────────────
const SUPABASE_URL = 'https://zuytxrufqgkcqqwspops.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vnxNAyti7IDiHK4swAj47Q_fsxRQYlM';
let _supabase = null;
function getSupabase() {
  if (!_supabase && typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// ─── FORM SUBMISSION ─────────────────────────────────────────
const applyForm  = document.getElementById('applyForm');
const formStatus = document.getElementById('formStatus');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const btnLoader  = document.getElementById('btnLoader');

applyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled        = true;
  btnText.style.display     = 'none';
  btnLoader.style.display   = 'block';
  formStatus.className      = 'form-status';
  formStatus.style.display  = 'none';

  const data = {
    full_name:       document.getElementById('fullName').value.trim(),
    email:           document.getElementById('email').value.trim(),
    phone:           document.getElementById('phone').value.trim(),
    creator_type:    document.getElementById('creatorType').value,
    followers_range: document.getElementById('followersRange').value,
    platform:        document.getElementById('platform').value,
    message:         document.getElementById('message').value.trim(),
    created_at:      new Date().toISOString()
  };

  try {
    const sb = getSupabase();
    if (!sb) throw new Error('Database not available');
    const { error } = await sb.from('applications').insert([data]);
    if (error) throw error;
    closeModal();
    applyForm.reset();
    showSuccessPopup();
  } catch (err) {
    console.error('Supabase error:', err);
    formStatus.textContent    = '⚠️ Something went wrong. Please try again or email hello@sellixa.com';
    formStatus.className      = 'form-status error';
    formStatus.style.display  = 'block';
  } finally {
    submitBtn.disabled      = false;
    btnText.style.display   = 'block';
    btnLoader.style.display = 'none';
  }
});

// ─── SUCCESS POPUP ───────────────────────────────────────────
const successPopup = document.getElementById('successPopup');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const confettiWrap  = document.getElementById('confettiWrap');
const CONFETTI_COLORS = ['#F5C400','#FFD940','#2D6A4F','#52b788','#fff','#D4A800'];

function spawnConfetti() {
  confettiWrap.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    el.style.cssText = `
      left:${Math.random() * 100}%;
      top:-10px;
      background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      animation-delay:${Math.random() * 0.9}s;
      animation-duration:${1.2 + Math.random() * 0.9}s;
      width:${6 + Math.random() * 8}px;
      height:${6 + Math.random() * 8}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    confettiWrap.appendChild(el);
  }
}
function showSuccessPopup() {
  spawnConfetti();
  successPopup.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => popupCloseBtn.focus(), 420);
}
function hideSuccessPopup() {
  successPopup.classList.remove('active');
  document.body.style.overflow = '';
}
popupCloseBtn.addEventListener('click', hideSuccessPopup);
successPopup.addEventListener('click', e => { if (e.target === successPopup) hideSuccessPopup(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (successPopup.classList.contains('active')) hideSuccessPopup();
    else if (backdrop.classList.contains('active')) closeModal();
  }
});

// ─── FAQ ACCORDION ───────────────────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answer   = document.getElementById(btn.getAttribute('aria-controls'));

    // Close all
    document.querySelectorAll('.faq-question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
      if (otherAnswer) otherAnswer.hidden = true;
      const icon = other.querySelector('.faq-icon');
      if (icon) icon.textContent = '+';
    });

    // Toggle current
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      if (answer) answer.hidden = false;
      const icon = btn.querySelector('.faq-icon');
      if (icon) icon.textContent = '×';
    }
  });
});

// ─── PRICING SPLIT BAR ANIMATION ─────────────────────────────
const splitObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.split-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0';
        requestAnimationFrame(() => {
          bar.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
          bar.style.width = w;
        });
      });
      splitObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.pricing-card').forEach(c => splitObserver.observe(c));

// ─── ACTIVE NAV HIGHLIGHT ────────────────────────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.removeAttribute('aria-current');
        if (a.getAttribute('href') === '#' + entry.target.id) {
          a.setAttribute('aria-current', 'page');
        }
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));
