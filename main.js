/* ============================================
  CRAFTBASE — Global JavaScript Utilities
  ============================================ */

// ── Navbar active link highlight ──
function initNavbar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    // Exact match for file names to avoid false positives
    if (href && (href === currentPage || href.endsWith('/' + currentPage))) {
      link.classList.add('active');
    }
  });
}

// ── Mobile nav toggle ──
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!toggle || !mobileMenu) return;
  toggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── Star Rating (display) ──
function renderStars(rating, max = 5) {
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(rating)) html += '<span class="star filled">★</span>';
    else if (i - 0.5 <= rating) html += '<span class="star half">★</span>';
    else html += '<span class="star">★</span>';
  }
  return html + '</div>';
}

// ── Interactive Star Rating Input ──
function initStarInputs() {
  document.querySelectorAll('.star-input').forEach(group => {
    const stars = group.querySelectorAll('.star');
    const input = group.previousElementSibling;
    stars.forEach((star, idx) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => s.classList.toggle('filled', i <= idx));
      });
      star.addEventListener('mouseleave', () => {
        const val = parseInt(input?.value || 0);
        stars.forEach((s, i) => s.classList.toggle('filled', i < val));
      });
      star.addEventListener('click', () => {
        if (input) input.value = idx + 1;
        stars.forEach((s, i) => s.classList.toggle('filled', i <= idx));
      });
    });
  });
}

// ── Tabs ──
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.tab');
    // Look for panels within the tab group or nearby
    const panelContainer = tabGroup.closest('[data-tab-panels]') || tabGroup.parentElement;
    const panels = panelContainer?.querySelectorAll('.tab-panel') || [];
    
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.forEach((p, j) => p.classList.toggle('hidden', i !== j));
      });
    });
  });
}

// ── Modal ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}
function initModals() {
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        const modal = el.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

// ── Toast Notifications ──
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' };
  const colors = { success: '#2ecc71', error: '#e74c3c', info: '#4a7cf8', warn: '#f5a623' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background:#1e2535;border:1px solid ${colors[type]}33;border-left:3px solid ${colors[type]};
    color:#e8eaf0;padding:12px 16px;border-radius:6px;font-size:0.88rem;
    display:flex;align-items:center;gap:10px;min-width:260px;max-width:360px;
    animation:fadeUp 0.3s ease both;box-shadow:0 4px 24px rgba(0,0,0,0.4);
  `;
  toast.innerHTML = `<span style="color:${colors[type]};font-weight:700">${icons[type]}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = '0.3s ease'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── Fake auth state (demo) ──
const Auth = {
  user: null,
  _storageKey: 'craftbase_user',
  
  init() {
    const stored = localStorage.getItem(this._storageKey);
    if (stored) {
      try {
        this.user = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        this.logout();
      }
    }
  },
  
  login(user) { 
    this.user = user; 
    localStorage.setItem(this._storageKey, JSON.stringify(user)); 
    updateNavForRole(user.role); 
  },
  
  logout() { 
    this.user = null; 
    localStorage.removeItem(this._storageKey); 
    updateNavForRole(null); 
  },
  
  isLoggedIn() { 
    return !!this.user; 
  },
  
  getRole() { 
    return this.user?.role || 'guest'; 
  }
};

function updateNavForRole(role) {
  const guestLinks = document.querySelectorAll('.nav-guest');
  const userLinks = document.querySelectorAll('.nav-user');
  const companyLinks = document.querySelectorAll('.nav-company');
  const adminLinks = document.querySelectorAll('.nav-admin');
  const avatarEl = document.getElementById('nav-avatar');
  const loginBtn = document.getElementById('nav-login');

  guestLinks.forEach(el => el.style.display = (role === 'guest') ? '' : 'none');
  userLinks.forEach(el => el.style.display = (role === 'USER') ? '' : 'none');
  companyLinks.forEach(el => el.style.display = (role === 'COMPANY') ? '' : 'none');
  adminLinks.forEach(el => el.style.display = (role === 'ADMIN') ? '' : 'none');

  if (avatarEl) avatarEl.style.display = (role !== 'guest') ? 'flex' : 'none';
  if (loginBtn) loginBtn.style.display = (role === 'guest') ? '' : 'none';

  if (avatarEl && Auth.user) {
    const initial = Auth.user.name?.charAt(0)?.toUpperCase() || 'U';
    const userRole = Auth.user.role;
    const dashLink = userRole === 'COMPANY' ? 'dashboard-company.html' : 'dashboard-user.html';
    avatarEl.innerHTML = `
      ${initial}
      <div class="nav-dropdown" id="nav-dropdown">
        <div class="nav-dropdown-name">${Auth.user.name || 'User'}</div>
        <a href="${dashLink}" class="nav-dropdown-item">Dashboard</a>
        <div class="nav-dropdown-item" onclick="Auth.logout();window.location.href='index.html'" style="cursor:pointer;color:#e74c3c;">Log Out</div>
      </div>
    `;
    avatarEl.style.position = 'relative';
    avatarEl.style.cursor = 'pointer';
    avatarEl.onclick = (e) => {
      e.stopPropagation();
      const dd = document.getElementById('nav-dropdown');
      if (dd) dd.classList.toggle('open');
    };
    document.addEventListener('click', () => {
      const dd = document.getElementById('nav-dropdown');
      if (dd) dd.classList.remove('open');
    });
  }
}

// ── Scroll animations ──
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeUp');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

// ── Format helpers ──
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatBudget(min, max) {
  if (!min && !max) return 'Budget flexible';
  const fmt = n => '$' + Number(n).toLocaleString();
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}
function formatRating(avg) { return Number(avg).toFixed(1); }

// ── Sample data ──
const SAMPLE = {
  companies: [
    { id:1, name:'Apex Construction Group', area:'Rawalpindi', specialization:['full_construction','renovation'], avgRating:4.8, totalReviews:142, badges:['top_rated','most_hired','verified'], logo:'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="apex-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f5a623;stop-opacity:1"/><stop offset="100%" style="stop-color:#d68910;stop-opacity:1"/></linearGradient></defs><rect width="64" height="64" fill="url(#apex-grad)" rx="8"/><polygon points="32,8 56,32 32,56 8,32" fill="none" stroke="white" stroke-width="3"/><polygon points="32,16 48,32 32,48 16,32" fill="none" stroke="white" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="white"/></svg>', verified:true },
    { id:2, name:'BuildRight Solutions', area:'Islamabad', specialization:['plumbing','electrical'], avgRating:4.6, totalReviews:87, badges:['fast_responder','verified'], logo:'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="buildright-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3498db;stop-opacity:1"/><stop offset="100%" style="stop-color:#2980b9;stop-opacity:1"/></linearGradient></defs><rect width="64" height="64" fill="url(#buildright-grad)" rx="8"/><rect x="12" y="40" width="8" height="16" fill="white"/><rect x="28" y="28" width="8" height="28" fill="white"/><rect x="44" y="16" width="8" height="40" fill="white"/><circle cx="16" cy="36" r="3" fill="white"/><circle cx="32" cy="24" r="3" fill="white"/><circle cx="48" cy="12" r="3" fill="white"/><line x1="16" y1="36" x2="32" y2="24" stroke="white" stroke-width="2"/><line x1="32" y1="24" x2="48" y2="12" stroke="white" stroke-width="2"/></svg>', verified:true },
    { id:3, name:'Prime Roofing Co.', area:'Lahore', specialization:['roofing'], avgRating:4.3, totalReviews:53, badges:['rising_star'], logo:'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="prime-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1"/><stop offset="100%" style="stop-color:#c0392b;stop-opacity:1"/></linearGradient></defs><rect width="64" height="64" fill="url(#prime-grad)" rx="8"/><polygon points="8,40 32,8 56,40" fill="none" stroke="white" stroke-width="3"/><polygon points="8,40 32,20 56,40" fill="none" stroke="white" stroke-width="2"/><rect x="28" y="32" width="8" height="8" fill="white"/><line x1="24" y1="36" x2="40" y2="36" stroke="white" stroke-width="2"/></svg>', verified:false },
    { id:4, name:'EcoHomes Builders', area:'Karachi', specialization:['full_construction'], avgRating:4.9, totalReviews:31, badges:['rising_star','fast_responder'], logo:'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="eco-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#27ae60;stop-opacity:1"/><stop offset="100%" style="stop-color:#229954;stop-opacity:1"/></linearGradient></defs><rect width="64" height="64" fill="url(#eco-grad)" rx="8"/><path d="M32,8 Q48,16 48,32 Q48,48 32,56 Q16,48 16,32 Q16,16 32,8 Z" fill="none" stroke="white" stroke-width="3"/><rect x="24" y="32" width="16" height="16" fill="none" stroke="white" stroke-width="2"/><circle cx="32" cy="24" r="4" fill="white"/><path d="M20,44 Q32,36 44,44" fill="none" stroke="white" stroke-width="2"/></svg>', verified:true },
    { id:5, name:'Urban Renovate', area:'Rawalpindi', specialization:['renovation','interior'], avgRating:4.1, totalReviews:64, badges:[], logo:'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="urban-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#9b59b6;stop-opacity:1"/><stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1"/></linearGradient></defs><rect width="64" height="64" fill="url(#urban-grad)" rx="8"/><rect x="8" y="8" width="48" height="48" fill="none" stroke="white" stroke-width="3"/><line x1="8" y1="20" x2="56" y2="20" stroke="white" stroke-width="2"/><line x1="8" y1="32" x2="56" y2="32" stroke="white" stroke-width="2"/><line x1="8" y1="44" x2="56" y2="44" stroke="white" stroke-width="2"/><line x1="20" y1="8" x2="20" y2="56" stroke="white" stroke-width="2"/><line x1="32" y1="8" x2="32" y2="56" stroke="white" stroke-width="2"/><line x1="44" y1="8" x2="44" y2="56" stroke="white" stroke-width="2"/></svg>', verified:false },
    { id:6, name:'SteelFrame Pros', area:'Faisalabad', specialization:['full_construction','commercial'], avgRating:4.7, totalReviews:108, badges:['most_hired','verified'], logo:'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="steel-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#34495e;stop-opacity:1"/><stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1"/></linearGradient></defs><rect width="64" height="64" fill="url(#steel-grad)" rx="8"/><line x1="8" y1="8" x2="56" y2="8" stroke="white" stroke-width="4"/><line x1="8" y1="8" x2="8" y2="56" stroke="white" stroke-width="4"/><line x1="56" y1="8" x2="56" y2="56" stroke="white" stroke-width="4"/><line x1="8" y1="56" x2="56" y2="56" stroke="white" stroke-width="4"/><line x1="8" y1="24" x2="56" y2="24" stroke="white" stroke-width="3"/><line x1="8" y1="40" x2="56" y2="40" stroke="white" stroke-width="3"/><line x1="24" y1="8" x2="24" y2="56" stroke="white" stroke-width="3"/><line x1="40" y1="8" x2="40" y2="56" stroke="white" stroke-width="3"/></svg>', verified:true },
  ],
  quotes: [
    { id:1, title:'Residential 3-Bedroom House Build', description:'Looking for a contractor to build a 3-bed, 2-bath home. Architect drawings available.', projectType:'residential', budgetMin:5000000, budgetMax:8000000, location:'Rawalpindi', timeline:'6 months', status:'OPEN', responses:4, createdAt:'2026-02-01' },
    { id:2, title:'Office Renovation – 2nd Floor', description:'Complete renovation of a 3000 sqft office space. New flooring, partition walls, and electrical.', projectType:'commercial', budgetMin:1500000, budgetMax:2500000, location:'Islamabad', timeline:'3 months', status:'OPEN', responses:2, createdAt:'2026-02-10' },
    { id:3, title:'Roof Replacement for Villa', description:'Old roof needs full replacement. Property in DHA Phase 2.', projectType:'residential', budgetMin:300000, budgetMax:600000, location:'Lahore', timeline:'1 month', status:'HIRED', responses:6, createdAt:'2026-01-20' },
  ],
  reviews: [
    { id:1, companyId:1, user:'Ahmed K.', avatar:'A', ratingQuality:5, ratingTimeliness:4, ratingComm:5, ratingValue:5, comment:'Excellent work. The team was professional, finished on schedule and quality of materials was top tier.', verifiedHire:true, createdAt:'2026-01-15' },
    { id:2, companyId:1, user:'Sara M.', avatar:'S', ratingQuality:4, ratingTimeliness:5, ratingComm:4, ratingValue:4, comment:'Very responsive and punctual. Would definitely hire again.', verifiedHire:true, createdAt:'2026-01-28' },
    { id:3, companyId:1, user:'Bilal R.', avatar:'B', ratingQuality:5, ratingTimeliness:5, ratingComm:5, ratingValue:4, comment:'Best construction company I have worked with in Rawalpindi.', verifiedHire:true, createdAt:'2026-02-05' },
  ],
  threads: [
    { id:1, title:'Best materials for earthquake-resistant homes in Pakistan?', body:'We are planning to build in a zone 3 area. What materials should we insist the contractor uses?', category:'general', upvotes:28, replies:12, user:'Ahmed K.', createdAt:'2026-02-12' },
    { id:2, title:'How to avoid contractor scams — my experience', body:'After getting burned twice, here is what I now ask every company before signing anything.', category:'legal', upvotes:54, replies:21, user:'Sara M.', createdAt:'2026-02-10' },
    { id:3, title:'Roofing in monsoon season — should I wait?', body:'Contractor is ready to start roof work next month. Monsoon starts in June. Should I delay?', category:'roofing', upvotes:16, replies:8, user:'Tariq F.', createdAt:'2026-02-15' },
    { id:4, title:'Average cost per sqft for full construction in Islamabad 2026?', body:'Looking to get realistic numbers before requesting quotes. What are people paying currently?', category:'budget', upvotes:41, replies:19, user:'Nadia A.', createdAt:'2026-02-08' },
  ]
};

// ── Init everything on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  Auth.init(); // Initialize auth from localStorage
  initNavbar();
  initMobileNav();
  initStarInputs();
  initTabs();
  initModals();
  initScrollAnimations();
  updateNavForRole(Auth.getRole());

  // Demo login buttons in dev
  window._demoLogin = (role) => {
    const demos = { USER: { id:1, name:'Ahmed Khan', email:'ahmed@example.com', role:'USER' }, COMPANY: { id:2, name:'Apex Construction', email:'apex@example.com', role:'COMPANY' }, ADMIN: { id:3, name:'Admin', email:'admin@ch.com', role:'ADMIN' } };
    Auth.login(demos[role] || demos.USER);
    showToast(`Logged in as ${role}`, 'success');
  };
});

// ── Antigravity particle overlay ──
(function(){
  let canvas, ctx, particles = [], animId = null, mouse = { x: -9999, y: -9999 }, enabled = false;
  const PARTICLE_COUNT = 80;

  function rand(min, max){ return Math.random() * (max - min) + min; }

  class P {
    constructor(w,h){
      this.reset(w,h);
    }
    reset(w,h){
      this.x = rand(0,w);
      this.y = rand(0,h);
      this.vx = rand(-0.2,0.2);
      this.vy = rand(-0.4, -0.8); // upward bias = anti-gravity
      this.size = rand(1,3.6);
      this.life = rand(6,12);
      this.alpha = rand(0.08,0.28);
      this.hue = Math.floor(rand(33,210));
    }
    step(w,h){
      // upward lift
      this.vy -= 0.0012;
      // apply velocity
      this.x += this.vx;
      this.y += this.vy;
      // slight drag
      this.vx *= 0.995; this.vy *= 0.995;
      // mouse repulsion (anti-grav effect locally)
      const dx = this.x - mouse.x; const dy = this.y - mouse.y; const d2 = dx*dx + dy*dy;
      if (d2 < 25000) {
        const f = 20000 / (d2 + 1000);
        this.vx += (dx / Math.sqrt(d2)) * f * 0.0005;
        this.vy += (dy / Math.sqrt(d2)) * f * 0.0005;
      }
      // respawn when out of bounds
      if (this.y < -40 || this.x < -60 || this.x > w + 60) this.reset(w,h);
    }
    draw(c){
      c.beginPath();
      c.fillStyle = `hsla(${this.hue},70%,65%,${this.alpha})`;
      c.arc(this.x, this.y, this.size, 0, Math.PI*2);
      c.fill();
    }
  }

  function createCanvas(){
    canvas = document.createElement('canvas');
    canvas.className = 'antigravity-canvas';
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
  }

  function destroyCanvas(){
    window.removeEventListener('resize', resize);
    if (canvas){ canvas.removeEventListener('mousemove', onMouseMove); canvas.removeEventListener('mouseleave', onMouseLeave); canvas.remove(); canvas = null; ctx = null; }
    particles = [];
  }

  function resize(){
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // recreate particles to fit viewport
    particles = new Array(PARTICLE_COUNT).fill(0).map(() => new P(canvas.width, canvas.height));
  }

  function onMouseMove(e){ mouse.x = e.clientX; mouse.y = e.clientY; }
  function onMouseLeave(){ mouse.x = -9999; mouse.y = -9999; }

  function animate(){
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // subtle background glow
    const g = ctx.createRadialGradient(canvas.width*0.7, canvas.height*0.2, 0, canvas.width*0.7, canvas.height*0.2, canvas.width*0.8);
    g.addColorStop(0, 'rgba(245,166,35,0.035)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);

    for (let p of particles){ p.step(canvas.width, canvas.height); p.draw(ctx); }
    animId = requestAnimationFrame(animate);
  }

  function enable(){ if (enabled) return; enabled = true; createCanvas(); animate(); }
  function disable(){ if (!enabled) return; enabled = false; if (animId) cancelAnimationFrame(animId); animId = null; destroyCanvas(); }

  // impact loop: animate decorative items occasionally
  let impactInterval = null;
  function triggerImpactOnce(el){
    if (!el) return;
    el.classList.remove('impact');
    // force reflow
    void el.offsetWidth;
    el.classList.add('impact');
    // if the element contains a lottie player, briefly boost its speed/play
    const player = el.querySelector && el.querySelector('lottie-player');
    if (player) {
      try {
        if (typeof player.setSpeed === 'function') player.setSpeed(1.6);
        if (typeof player.play === 'function') player.play();
        else player.play && player.play();
        setTimeout(() => { if (typeof player.setSpeed === 'function') player.setSpeed(1); }, 700);
      } catch (e) {}
    }
    setTimeout(() => el.classList.remove('impact'), 700);
  }
  function startImpactLoop(){
    stopImpactLoop();
    const els = Array.from(document.querySelectorAll('.ag-impact'));
    if (!els.length) return;
    impactInterval = setInterval(() => {
      const idx = Math.floor(Math.random() * els.length);
      triggerImpactOnce(els[idx]);
    }, 2800 + Math.random()*2000);
  }
  function stopImpactLoop(){ if (impactInterval) { clearInterval(impactInterval); impactInterval = null; } }

  document.addEventListener('DOMContentLoaded', () => {
    // auto-enable antigravity on load
    enable();
    // set svg sizes to match hero tagline
    function setAgSize(){
      const tag = document.querySelector('.hero-tagline');
      if (!tag) return;
      const fs = parseFloat(getComputedStyle(tag).fontSize) || 14;
      // scale multiplier so icons are roughly similar height to tagline text
      const px = Math.round(fs * 1.6);
      document.documentElement.style.setProperty('--ag-size', px + 'px');
    }
    setAgSize();
    window.addEventListener('resize', setAgSize);
    // start decorative impacts
    startImpactLoop();
  });

  // expose for debugging
  window.Antigravity = { enable, disable, isEnabled: () => enabled };
})();