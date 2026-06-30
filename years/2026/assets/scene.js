/* ============================================================
   Rizumon scene engine — shared across variants
   Configure per page via window.RIZ_CONFIG before this loads:
     { particle: 'petal'|'leaf'|'sparkle', grass: 220, parallax: true }
   ============================================================ */
(function () {
  const CFG = Object.assign(
    { particle: 'petal', grass: 200, parallax: true, tuftRows: 1 },
    window.RIZ_CONFIG || {}
  );
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // resolve sprite folder relative to THIS script, so pages work at any depth
  const ASSET_BASE = (() => {
    const s = document.currentScript || document.querySelector('script[src*="scene.js"]');
    return (s && s.src) ? s.src.replace(/[^/]*$/, '') : '../assets/';
  })();

  /* ---------- SVG sprite library (squares & blocks only) ---------- */
  const SPRITES = {
    heart: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 5h2V3h4v2h4V3h4v2h2v4h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2H4v-2H2V9H0V5h2z" transform="translate(0 0)"/></svg>',
    // simple pixel hearts/leaf/flame/drop built from rects via path
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z"/><path d="M8 16c2-3 5-5 8-6"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1-2-1-4 1-9z"/></svg>',
    water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9l-5 4.2L17.6 21 12 17l-5.6 4 1.6-7.8L3 9l6.6-.4z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>',
    cloud: '<svg viewBox="0 0 64 40" fill="currentColor"><path d="M16 36a12 12 0 0 1 0-24c1 0 3 0 4 1A14 14 0 0 1 46 14a10 10 0 0 1 2 22z"/></svg>',
  };
  window.RIZ_SPRITES = SPRITES;

  function injectSprites() {
    document.querySelectorAll('[data-sprite]').forEach((el) => {
      const key = el.getAttribute('data-sprite');
      if (SPRITES[key]) el.innerHTML = SPRITES[key];
    });
  }

  /* ---------- pixel grass tuft (SVG of stacked rects) ---------- */
  function tuftSVG(shade, h) {
    // 3 blades of different heights, blocky
    const c = shade;
    const d = `M0 0`; // unused
    return `
      <svg width="${18}" height="${h}" viewBox="0 0 18 28" preserveAspectRatio="none" shape-rendering="crispEdges">
        <rect x="2"  y="10" width="4" height="18" fill="${c.mid}"/>
        <rect x="2"  y="10" width="2" height="18" fill="${c.dark}"/>
        <rect x="7"  y="2"  width="4" height="26" fill="${c.light}"/>
        <rect x="7"  y="2"  width="2" height="26" fill="${c.mid}"/>
        <rect x="12" y="8"  width="4" height="20" fill="${c.mid}"/>
        <rect x="12" y="8"  width="2" height="20" fill="${c.dark}"/>
      </svg>`;
  }
  const GRASS_SHADES = [
    { light: '#c6ee94', mid: '#9bd66a', dark: '#7cc24f' },
    { light: '#b6e487', mid: '#8ccc5b', dark: '#6fb845' },
    { light: '#d2f0a6', mid: '#aadd7d', dark: '#8bcb5b' },
  ];

  const TUFTS = [ASSET_BASE + 'sprites/tuft-1.png', ASSET_BASE + 'sprites/tuft-2.png', ASSET_BASE + 'sprites/tuft-3.png'];
  const FLOWERS = [ASSET_BASE + 'sprites/flower-1.png', ASSET_BASE + 'sprites/flower-2.png', ASSET_BASE + 'sprites/flower-3.png'];

  function buildGrass() {
    const line = document.querySelector('.grassline');
    if (!line) return;
    const W = window.innerWidth;
    const count = Math.max(24, Math.round((W / 1280) * CFG.grass));
    let html = '';
    for (let i = 0; i < count; i++) {
      const x = (i / count) * 100 + rand(-1.4, 1.4);
      const scale = rand(0.6, 1.5);
      const w = Math.round(rand(20, 30));
      const src = pick(TUFTS);
      const dur = rand(2.6, 4.4).toFixed(2);
      const delay = rand(-4, 0).toFixed(2);
      const z = Math.round(scale * 10);
      html += `<span class="tuft" style="left:${x}%;transform:scale(${scale});--dur:${dur}s;--delay:${delay}s;z-index:${z};opacity:${rand(0.9,1).toFixed(2)}"><img class="px" src="${src}" width="${w}" alt=""></span>`;
    }
    // sprinkle a few flowers among the grass
    const fcount = Math.max(3, Math.round(count * 0.06));
    for (let i = 0; i < fcount; i++) {
      const x = rand(1, 99);
      const w = Math.round(rand(15, 24));
      const src = pick(FLOWERS);
      const dur = rand(2.8, 4.6).toFixed(2);
      const delay = rand(-4, 0).toFixed(2);
      html += `<span class="tuft grass-flower" style="left:${x}%;bottom:${rand(-2,10)}px;transform:scale(1);--dur:${dur}s;--delay:${delay}s;z-index:13"><img class="px" src="${src}" width="${w}" alt=""></span>`;
    }
    line.innerHTML = html;
  }

  /* ---------- particles ---------- */
  function particleEl(type) {
    const el = document.createElement('span');
    el.className = 'pp';
    const size = rand(8, 16);
    const startX = rand(0, 100);
    const dur = rand(9, 18);
    const delay = rand(-18, 0);
    const dx = rand(-60, 60);
    const rot = rand(-260, 260);
    const op = rand(0.55, 0.95);
    el.style.left = startX + '%';
    el.style.bottom = rand(-10, 30) + '%';
    el.style.setProperty('--pdur', dur + 's');
    el.style.setProperty('--pdelay', delay + 's');
    el.style.setProperty('--pdx', dx + 'px');
    el.style.setProperty('--pdy', '-' + rand(80, 120) + 'vh');
    el.style.setProperty('--prot', rot + 'deg');
    el.style.setProperty('--popacity', op);

    if (type === 'petal') {
      el.style.width = size + 'px';
      el.style.height = size * 0.8 + 'px';
      el.style.background = pick(['#ffd0dd', '#ffbcd0', '#ffe1ea', '#ffc4d6']);
      el.style.borderRadius = '60% 10% 60% 10%';
    } else if (type === 'leaf') {
      el.style.width = size + 'px';
      el.style.height = size * 0.7 + 'px';
      el.style.background = pick(['#8ccc5b', '#a6dd72', '#6fb845']);
      el.style.borderRadius = '70% 10% 70% 10%';
    } else if (type === 'ember') {
      el.style.width = size * 0.7 + 'px';
      el.style.height = size * 0.7 + 'px';
      el.style.background = pick(['#ff9b6b', '#ffb27d', '#ff7a4d']);
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 8px rgba(255,140,80,0.55)';
    } else if (type === 'droplet') {
      el.style.width = size * 0.7 + 'px';
      el.style.height = size + 'px';
      el.style.background = pick(['#9fd0f3', '#bfe2fb', '#7cbdee']);
      el.style.borderRadius = '60% 60% 60% 60% / 80% 80% 40% 40%';
    } else { // sparkle
      el.style.width = size * 0.7 + 'px';
      el.style.height = size * 0.7 + 'px';
      el.style.background = 'transparent';
      el.style.color = pick(['#ffe08a', '#fff3c4', '#ffd0dd']);
      el.innerHTML = SPRITES.star;
      el.firstChild.setAttribute('width', '100%');
      el.firstChild.setAttribute('height', '100%');
    }
    return el;
  }

  function buildParticles() {
    if (reduce) return;
    const box = document.querySelector('.particles');
    if (!box) return;
    box.innerHTML = '';
    const n = Math.round(rand(26, 34));
    for (let i = 0; i < n; i++) box.appendChild(particleEl(CFG.particle));
  }

  /* ---------- starter pick: re-tints accent + swaps particles ---------- */
  const TYPE_ACCENTS = {
    leaf:  { accent: '#7fd07f', deep: '#3fa346', particle: 'leaf' },
    fire:  { accent: '#ff9a6b', deep: '#ef5a2f', particle: 'ember' },
    water: { accent: '#7cc0ee', deep: '#3a87cf', particle: 'droplet' },
  };
  let currentType = null;
  function pickStarter(type, opts) {
    opts = opts || {};
    const root = document.documentElement;
    const a = TYPE_ACCENTS[type];
    if (!a) return;
    currentType = type;
    root.style.setProperty('--accent', a.accent);
    root.style.setProperty('--accent-deep', a.deep);
    document.querySelectorAll('.starter').forEach((s) => {
      s.classList.toggle('is-active', s.dataset.type === type);
    });
    if (!opts.silent) {
      CFG.particle = a.particle;
      buildParticles();
    }
  }
  window.RIZ_pickStarter = pickStarter;

  function wireStarters() {
    document.querySelectorAll('.starter').forEach((s) => {
      s.addEventListener('click', () => pickStarter(s.dataset.type));
    });
  }

  /* ---------- in-game text dialogue (stepper + typewriter) ---------- */
  function initDialogue() {
    const dlg = document.querySelector('.dialog[data-dialogue]');
    if (!dlg) return;
    const msgs = [...dlg.querySelectorAll('.msg')];
    const nextBtn = dlg.querySelector('.next-btn');
    const backBtn = dlg.querySelector('.back-btn');
    const dots = dlg.querySelector('.dlg-dots');
    if (!msgs.length || !nextBtn) return;

    // capture editable text once, so re-typing reflects user copy
    msgs.forEach((m) => {
      if (!m.classList.contains('msg--final')) m.dataset.full = m.textContent.trim();
    });
    if (dots) dots.innerHTML = msgs.map(() => '<i></i>').join('');

    let idx = 0, typing = false, timer = null;

    function renderDots() {
      if (!dots) return;
      [...dots.children].forEach((d, i) => d.classList.toggle('on', i <= idx));
    }
    function typeOut(m) {
      clearTimeout(timer);
      const full = m.dataset.full || '';
      if (reduce) { m.textContent = full; typing = false; return; }
      typing = true;
      let n = 0;
      m.textContent = '';
      (function step() {
        n++;
        m.textContent = full.slice(0, n);
        if (n < full.length) { timer = setTimeout(step, 30); }
        else { typing = false; }
      })();
    }
    function complete() {
      clearTimeout(timer);
      const m = msgs[idx];
      if (!m.classList.contains('msg--final')) m.textContent = m.dataset.full || '';
      typing = false;
    }
    function updateNav(isFinal) {
      // keep layout stable with visibility (space reserved)
      if (backBtn) backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
      nextBtn.style.visibility = isFinal ? 'hidden' : 'visible';
    }
    function show(i, instant) {
      idx = i;
      msgs.forEach((m, j) => m.classList.toggle('is-active', j === i));
      const m = msgs[i];
      const isFinal = m.classList.contains('msg--final');
      dlg.classList.toggle('is-final', isFinal);
      renderDots();
      updateNav(isFinal);
      if (!isFinal) {
        if (instant || reduce) { clearTimeout(timer); m.textContent = m.dataset.full || ''; typing = false; }
        else typeOut(m);
      }
    }
    function advance() {
      if (typing) { complete(); return; }      // first click finishes typing
      if (idx < msgs.length - 1) show(idx + 1); // next advances (types)
    }
    nextBtn.addEventListener('click', advance);
    // click the text field itself to advance (ignore clicks on the buttons / CTA link inside it)
    const body = dlg.querySelector('.dlg-body');
    if (body) {
      body.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        advance();
      });
    }
    if (backBtn) backBtn.addEventListener('click', () => {
      clearTimeout(timer); typing = false;      // step back, show instantly (already read)
      if (idx > 0) show(idx - 1, true);
    });

    // gated mode: dialog stays hidden until something opens it (e.g. clicking a character)
    const gated = dlg.hasAttribute('data-gated');
    function open() { dlg.classList.add('is-open'); dlg.classList.remove('is-closed'); show(0); }
    function close() { clearTimeout(timer); typing = false; dlg.classList.remove('is-open'); dlg.classList.add('is-closed'); }
    window.RIZ_openDialogue = open;
    window.RIZ_closeDialogue = close;
    if (gated) close(); else show(0);
  }
  window.RIZ_initDialogue = initDialogue;

  /* ---------- gentle mouse parallax for [data-par] layers ---------- */
  function wireParallax() {
    if (!CFG.parallax || reduce) return;
    const layers = [...document.querySelectorAll('[data-par]')];
    if (!layers.length) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    (function loop() {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.par) || 10;
        l.style.transform = `translate(${cx * d}px, ${cy * d * 0.5}px)`;
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- init ---------- */
  function init() {
    injectSprites();
    buildGrass();
    buildParticles();
    wireStarters();
    initDialogue();
    wireParallax();
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { buildGrass(); }, 200);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
