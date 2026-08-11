/* ============================================
   1) TEMA CLARO / OSCURO
   ============================================ */
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applyTheme(theme) {
  body.setAttribute('data-theme', theme);
  localStorage.setItem('mh-theme', theme);
}

const savedTheme = localStorage.getItem('mh-theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = body.getAttribute('data-theme');
  applyTheme(current === 'light' ? 'dark' : 'light');
});

/* ============================================
   2) IDIOMA ES / EN
   ============================================ */
const langToggle = document.getElementById('lang-toggle');
const translatable = document.querySelectorAll('[data-es][data-en]');

function applyLang(lang) {
  document.documentElement.lang = lang;
  translatable.forEach(el => {
    el.innerHTML = el.getAttribute(`data-${lang}`);
  });
  langToggle.textContent = lang === 'es' ? 'EN' : 'ES';
  localStorage.setItem('mh-lang', lang);
}

const savedLang = localStorage.getItem('mh-lang') || 'es';
applyLang(savedLang);

langToggle.addEventListener('click', () => {
  const current = localStorage.getItem('mh-lang') || 'es';
  applyLang(current === 'es' ? 'en' : 'es');
});

/* ============================================
   3) RED DE MICELIO — partículas conectadas
   que reaccionan al cursor
   ============================================ */
const canvas = document.getElementById('mycelium');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
const NODE_COUNT = 70;
const LINK_DISTANCE = 130;
const CURSOR_RADIUS = 180;

const mouse = { x: -9999, y: -9999 };
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function getLineColor() {
  const theme = body.getAttribute('data-theme');
  return theme === 'dark' ? '143, 166, 135' : '75, 93, 69'; // RGB de --moss
}

class Node {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.radius = Math.random() * 1.5 + 0.8;
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }
}

function initNodes() {
  nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const rgb = getLineColor();

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!prefersReducedMotion) n.move();

    // distancia al cursor
    const dCursor = Math.hypot(n.x - mouse.x, n.y - mouse.y);

    // conexiones entre nodos cercanos
    for (let j = i + 1; j < nodes.length; j++) {
      const m = nodes[j];
      const d = Math.hypot(n.x - m.x, n.y - m.y);
      if (d < LINK_DISTANCE) {
        const baseOpacity = (1 - d / LINK_DISTANCE) * 0.15;
        const cursorBoost = dCursor < CURSOR_RADIUS ? (1 - dCursor / CURSOR_RADIUS) * 0.35 : 0;
        ctx.strokeStyle = `rgba(${rgb}, ${baseOpacity + cursorBoost})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }
    }

    // nodo (spore)
    const nodeOpacity = dCursor < CURSOR_RADIUS ? 0.5 + (1 - dCursor / CURSOR_RADIUS) * 0.5 : 0.35;
    ctx.fillStyle = `rgba(${rgb}, ${nodeOpacity})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

window.addEventListener('resize', () => {
  resize();
  initNodes();
});

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

resize();
initNodes();
draw();

