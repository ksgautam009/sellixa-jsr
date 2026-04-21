// ─── NAVBAR SCROLL ───
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── MOBILE MENU ───
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const spans = menuToggle.querySelectorAll('span');
  if (navLinks.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuToggle.querySelectorAll('span').forEach(s => {
      s.style.transform = 'none'; s.style.opacity = '1';
    });
  });
});

// ─── SCROLL REVEAL ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── CAROUSELS ───
function initCarousel(trackId, dotsId) {
  const track = document.getElementById(trackId);
  const dotsContainer = document.getElementById(dotsId);
  if (!track || !dotsContainer) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let index = 0;
  let autoTimer;

  function getVisible() {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, total - getVisible()); }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i === index ? ' active' : '');
      d.addEventListener('click', () => { index = i; slide(); resetAuto(); });
      dotsContainer.appendChild(d);
    }
  }

  function slide() {
    const gap = 24;
    const card = cards[0];
    const cardW = card.offsetWidth + gap;
    track.style.transform = `translateX(-${index * cardW}px)`;
    // Update dots
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

  // Auto-play
  function startAuto() { autoTimer = setInterval(next, 4000); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  // Touch / drag
  let startX = 0, isDragging = false;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 50) { prev(); resetAuto(); }
    else if (dx < -50) { next(); resetAuto(); }
  });
  track.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
  track.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.clientX - startX;
    if (dx > 50) { prev(); resetAuto(); }
    else if (dx < -50) { next(); resetAuto(); }
  });

  // Pause on hover
  track.closest('.carousel-wrapper').addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.closest('.carousel-wrapper').addEventListener('mouseleave', startAuto);

  // Resize
  window.addEventListener('resize', () => { if (index > maxIndex()) index = maxIndex(); buildDots(); slide(); });

  buildDots();
  slide();
  startAuto();
}

initCarousel('creatorsTrack', 'creatorsDots');
initCarousel('servicesTrack', 'servicesDots');


// ─── DONUT COUNTER ───
let counted = false;
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counted) {
      counted = true;
      const bigEl = document.querySelector('.donut-center .big');
      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        bigEl.textContent = count + '%';
        if (count >= 75) clearInterval(interval);
      }, 20);
    }
  });
}, { threshold: 0.5 });
const donut = document.querySelector('.donut-chart');
if (donut) counterObserver.observe(donut);

// ─── HLS VIDEO (Revenue BG) ───
const revenueVideo = document.getElementById('revenueVideo');
const hlsUrl = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
if (revenueVideo) {
  if (Hls.isSupported()) {
    const hls = new Hls({ autoStartLoad: true });
    hls.loadSource(hlsUrl);
    hls.attachMedia(revenueVideo);
    hls.on(Hls.Events.MANIFEST_PARSED, () => revenueVideo.play());
  } else if (revenueVideo.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari native HLS
    revenueVideo.src = hlsUrl;
    revenueVideo.addEventListener('loadedmetadata', () => revenueVideo.play());
  }
}

// ─── MODAL ───
const backdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');

function openModal() {
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// All open-modal triggers
document.querySelectorAll('.open-modal').forEach(btn => {
  btn.addEventListener('click', openModal);
});

// Close on X button
modalClose.addEventListener('click', closeModal);

// Close on backdrop click
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── SUPABASE ───
const SUPABASE_URL = 'https://zuytxrufqgkcqqwspops.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vnxNAyti7IDiHK4swAj47Q_fsxRQYlM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── FORM SUBMISSION ───
const applyForm = document.getElementById('applyForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

applyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Loading state
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  formStatus.className = 'form-status';
  formStatus.style.display = 'none';

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
    const { error } = await _supabase
      .from('applications')
      .insert([data]);

    if (error) throw error;

    // Close form modal
    closeModal();
    applyForm.reset();

    // Show success popup with confetti
    showSuccessPopup();

  } catch (err) {
    console.error('Supabase error:', err);
    formStatus.textContent = '⚠️ Something went wrong. Please try again or email hello@sellixa.com';
    formStatus.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
  }
});

// ─── SUCCESS POPUP ───
const successPopup = document.getElementById('successPopup');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const confettiWrap = document.getElementById('confettiWrap');

const CONFETTI_COLORS = ['#F5C400','#FFD940','#2D6A4F','#52b788','#ffffff','#D4A800'];

function spawnConfetti() {
  confettiWrap.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-particle';
    el.style.left = Math.random() * 100 + '%';
    el.style.top = '-10px';
    el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.animationDelay = Math.random() * 0.8 + 's';
    el.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
    el.style.width = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confettiWrap.appendChild(el);
  }
}

function showSuccessPopup() {
  spawnConfetti();
  successPopup.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideSuccessPopup() {
  successPopup.classList.remove('active');
  document.body.style.overflow = '';
}

popupCloseBtn.addEventListener('click', hideSuccessPopup);
successPopup.addEventListener('click', (e) => {
  if (e.target === successPopup) hideSuccessPopup();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideSuccessPopup();
});

