/* =============================================
   PULSE DIGITAL — IPTV Landing Page
   script.js
   ============================================= */

'use strict';

/* -------------------------
   NAVBAR: scroll & mobile
------------------------- */
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMobile.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMobile.classList.remove('open');
  });
});

/* -------------------------
   PARTICLES (hero canvas)
------------------------- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = 60;
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1,
    color: ['#7c3aed', '#06b6d4', '#ec4899', '#f97316'][Math.floor(Math.random() * 4)],
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Connections
      particles.forEach(q => {
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 100) * 0.12;
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Move
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* -------------------------
   SCROLL REVEAL
------------------------- */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

/* -------------------------
   TABS (Cartelera)
------------------------- */
(function initTabs() {
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');

      // Re-trigger reveal for newly shown panel
      panel.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('revealed');
      });
    });
  });
})();

/* -------------------------
   APP SLIDER
------------------------- */
(function initSlider() {
  const track = document.getElementById('sliderTrack');
  const dots  = document.querySelectorAll('#sliderDots .dot');
  const prev  = document.getElementById('prevSlide');
  const next  = document.getElementById('nextSlide');
  if (!track) return;

  let current = 0;
  const total = track.children.length;
  let autoTimer;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index));
      resetAuto();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.parentElement.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.parentElement.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });

  goTo(0);
  startAuto();
})();

/* -------------------------
   PRICING — Duration switch
------------------------- */
(function initPricing() {
  // Prices per plan per duration (months): {dur: [plan1, plan2, plan3]}
  const prices = {
    1:  { p: [2500,   4000,   5500],   label: 'por mes' },
    3:  { p: [6750,   11000,  15000],  label: 'por 3 meses' },
    6:  { p: [12000,  18000,  26000],  label: 'por 6 meses' },
    12: { p: [18500,  32000,  48000],  label: 'por 12 meses' },
  };

  const durBtns = document.querySelectorAll('.dur-btn');
  const el1 = document.getElementById('price-1');
  const el2 = document.getElementById('price-2');
  const el3 = document.getElementById('price-3');
  const per1 = document.getElementById('period-1');
  const per2 = document.getElementById('period-2');
  const per3 = document.getElementById('period-3');

  function formatPrice(n) {
    return n.toLocaleString('es-CR');
  }

  function setDuration(dur) {
    const d = prices[dur];
    el1.textContent = formatPrice(d.p[0]);
    el2.textContent = formatPrice(d.p[1]);
    el3.textContent = formatPrice(d.p[2]);
    per1.textContent = d.label;
    per2.textContent = d.label;
    per3.textContent = d.label;
  }

  durBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      durBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setDuration(parseInt(btn.dataset.dur));
    });
  });

  // Initialize with 1 month
  setDuration(1);
})();

/* -------------------------
   MEDIA CARD — click ripple
------------------------- */
document.querySelectorAll('.media-card').forEach(card => {
  card.addEventListener('click', () => {
    // Animate to indicate contact
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      background:rgba(124,58,237,0.95);color:#fff;padding:20px 32px;
      border-radius:16px;font-family:'Rajdhani',sans-serif;font-size:1.1rem;
      font-weight:700;letter-spacing:1px;z-index:9999;text-align:center;
      box-shadow:0 0 40px rgba(124,58,237,0.6);animation:fadeInPop 0.3s ease;
    `;
    el.innerHTML = `
      📺 Contáctanos para ver este contenido<br>
      <a href="https://wa.me/15155068889" style="color:#4ade80;text-decoration:none;" target="_blank">▶ Contratar ahora</a>
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes fadeInPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.85)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`;
    document.head.appendChild(style);
    document.body.appendChild(el);

    el.addEventListener('click', () => el.remove());
    setTimeout(() => el.remove(), 3500);
  });
});

/* -------------------------
   SMOOTH ANCHOR SCROLL
------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 75;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* -------------------------
   CONSOLE BRANDING
------------------------- */
console.log(
  '%c⚡ PULSE DIGITAL IPTV%c\nLanding page by PulseDigital © 2025',
  'color:#7c3aed;font-size:20px;font-weight:900;font-family:monospace;',
  'color:#8888bb;font-size:12px;font-family:monospace;'
);
