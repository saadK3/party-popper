/* ===================================================
   PARTY POPPER APP — JavaScript
   =================================================== */

"use strict";

// ─────────────────────────────────────────────
// ✏️  CHANGE THE NAME HERE
// ─────────────────────────────────────────────
const PERSON_NAME = "Janaan"; // ← edit this line

const state = {
  color: "purple",
  popped: false,
};

// ─────────────────────────────────────────────
// 2. DOM refs
// ─────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const body = document.body;
const popperBtn = $("popperBtn");
const popperEmoji = $("popperEmoji");
const personName = $("personName");
const greetingLabel = $("greetingLabel");
const messageWrap = $("messageWrap");
const pressHint = $("pressHint");
const personalise = $("personaliseBtn");
const overlay = $("modalOverlay");
const modalClose = $("modalClose");
const colorPicks = document.querySelectorAll(".color-pick");
const canvas = $("confetti-canvas");
const ctx = canvas.getContext("2d");

// ─────────────────────────────────────────────
// 3. Apply theme from params
// ─────────────────────────────────────────────
function applyTheme(color) {
  body.dataset.theme = color;
}
applyTheme(state.color);

// ─────────────────────────────────────────────
// 4. Populate UI from state
// ─────────────────────────────────────────────
function renderFromState() {
  if (PERSON_NAME) {
    personName.textContent = PERSON_NAME;
    greetingLabel.textContent = "made with my vuww for my vuww ✨";
  } else {
    personName.textContent = "";
    greetingLabel.textContent = "For someone special ✨";
  }
}
renderFromState();

// ─────────────────────────────────────────────
// 5. Stars background
// ─────────────────────────────────────────────
(function spawnStars() {
  const container = $("stars");
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      --dur:${(Math.random() * 3 + 2).toFixed(1)}s;
      --delay:${(Math.random() * 5).toFixed(1)}s;
      --opacity:${(Math.random() * 0.6 + 0.2).toFixed(2)};
    `;
    container.appendChild(s);
  }
})();

// ─────────────────────────────────────────────
// 6. Confetti system
// ─────────────────────────────────────────────
let confettiPieces = [];
let animFrame = null;
let confettiRunning = false;

const COLORS_BY_THEME = {
  purple: ["#a855f7", "#7c3aed", "#e879f9", "#fbbf24", "#f9a8d4", "#ffffff"],
  rose: ["#f43f5e", "#fb7185", "#fda4af", "#fbbf24", "#a855f7", "#ffffff"],
  amber: ["#f59e0b", "#fbbf24", "#fcd34d", "#f43f5e", "#a855f7", "#ffffff"],
  teal: ["#14b8a6", "#2dd4bf", "#5eead4", "#a855f7", "#fbbf24", "#ffffff"],
  blue: ["#3b82f6", "#60a5fa", "#93c5fd", "#a855f7", "#fbbf24", "#ffffff"],
  pink: ["#ec4899", "#f472b6", "#fbcfe8", "#a855f7", "#fbbf24", "#ffffff"],
};

function spawnConfetti(count = 120) {
  const colors = COLORS_BY_THEME[state.color] || COLORS_BY_THEME.purple;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.38;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * 360 * Math.PI) / 180;
    const speed = Math.random() * 14 + 4;
    confettiPieces.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed * (Math.random() * 0.8 + 0.4),
      vy:
        Math.sin(angle) * speed * (Math.random() * 0.8 + 0.4) -
        Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      alpha: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      gravity: 0.35 + Math.random() * 0.2,
      drag: 0.975,
    });
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces = confettiPieces.filter((p) => p.alpha > 0.02);

  confettiPieces.forEach((p) => {
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.rotSpeed;
    if (p.y > canvas.height + 20) {
      p.alpha = 0;
      return;
    }
    if (p.y > canvas.height * 0.6) p.alpha -= 0.012;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    ctx.restore();
  });

  if (confettiPieces.length > 0) {
    animFrame = requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
  }
}

function triggerConfetti() {
  if (animFrame) cancelAnimationFrame(animFrame);
  spawnConfetti(140);
  confettiRunning = true;
  animateConfetti();

  // Extra burst after 300ms
  setTimeout(() => spawnConfetti(60), 300);
}

// ─────────────────────────────────────────────
// 7. Celebration bg flash
// ─────────────────────────────────────────────
function flashBackground() {
  let el = document.querySelector(".celebration-bg");
  if (!el) {
    el = document.createElement("div");
    el.className = "celebration-bg";
    document.body.insertBefore(el, document.body.firstChild);
  }
  el.classList.remove("flash");
  void el.offsetWidth; // reflow
  el.classList.add("flash");
}

// ─────────────────────────────────────────────
// 8. Sound (Web Audio API — no external deps)
// ─────────────────────────────────────────────
function playPopSound() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();

    // Whoosh
    const bufSize = ac.sampleRate * 0.4;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    src.connect(filter);

    const gainNode = ac.createGain();
    gainNode.gain.setValueAtTime(0.8, ac.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
    filter.connect(gainNode);
    gainNode.connect(ac.destination);
    src.start();

    // Pop click
    const osc = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 0.15);
    oscGain.gain.setValueAtTime(1, ac.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
    osc.connect(oscGain);
    oscGain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.2);

    // Sparkle tones
    [1200, 1600, 2000, 2400].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq + Math.random() * 200;
      const t = ac.currentTime + 0.05 + i * 0.06;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t);
      o.stop(t + 0.25);
    });
  } catch (e) {
    // audio not supported — silent fail
  }
}

// ─────────────────────────────────────────────
// 9. Pop handler
// ─────────────────────────────────────────────
const CELEBR_EMOJIS = [
  "🎊",
  "🎉",
  "🥳",
  "✨",
  "🌟",
  "💥",
  "🎈",
  "🎆",
  "🎇",
  "🍾",
  "🎠",
  "💫",
  "🌈",
  "🎀",
  "🥂",
];
function randomEmoji() {
  return CELEBR_EMOJIS[Math.floor(Math.random() * CELEBR_EMOJIS.length)];
}

function doPop() {
  if (state.popped) {
    // Allow re-popping with more confetti
    popperEmoji.textContent = randomEmoji();
    triggerConfetti();
    playPopSound();
    return;
  }

  state.popped = true;
  popperBtn.classList.add("popped");
  popperEmoji.textContent = randomEmoji();
  pressHint.classList.add("hidden");

  playPopSound();
  triggerConfetti();
  flashBackground();

  // Show message
  setTimeout(() => messageWrap.classList.add("visible"), 400);

  // Vibrate on mobile
  if (navigator.vibrate) navigator.vibrate([30, 50, 80, 50, 200]);
}

popperBtn.addEventListener("click", doPop);
popperBtn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    doPop();
  },
  { passive: false },
);

// ─────────────────────────────────────────────
// 11. Personalise modal — color only
// ─────────────────────────────────────────────
personalise.addEventListener("click", () => overlay.classList.add("open"));
modalClose.addEventListener("click", () => overlay.classList.remove("open"));
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.classList.remove("open");
});

// Color picks
colorPicks.forEach((pick) => {
  pick.addEventListener("click", () => {
    colorPicks.forEach((p) => p.classList.remove("active"));
    pick.classList.add("active");
    state.color = pick.dataset.color;
    applyTheme(state.color);
  });
});

// ─────────────────────────────────────────────
// 12. Auto-pop hint animation (wiggle after 3s)
// ─────────────────────────────────────────────
setTimeout(() => {
  if (!state.popped) {
    popperBtn.style.transition = "transform 0.2s ease";
    let count = 0;
    const wiggle = setInterval(() => {
      const dir = count % 2 === 0 ? 1 : -1;
      popperBtn.style.transform = `rotate(${dir * 6}deg) scale(1.04)`;
      count++;
      if (count > 5) {
        clearInterval(wiggle);
        popperBtn.style.transform = "";
        popperBtn.style.transition = "";
      }
    }, 120);
  }
}, 3500);
