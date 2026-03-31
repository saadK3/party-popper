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
let windX = 0;
let windY = 0;

const COLORS_BY_THEME = {
  purple: ["#a855f7", "#7c3aed", "#e879f9", "#fbbf24", "#f9a8d4", "#ffffff"],
  rose: ["#f43f5e", "#fb7185", "#fda4af", "#fbbf24", "#a855f7", "#ffffff"],
  amber: ["#f59e0b", "#fbbf24", "#fcd34d", "#f43f5e", "#a855f7", "#ffffff"],
  teal: ["#14b8a6", "#2dd4bf", "#5eead4", "#a855f7", "#fbbf24", "#ffffff"],
  blue: ["#3b82f6", "#60a5fa", "#93c5fd", "#a855f7", "#fbbf24", "#ffffff"],
  pink: ["#ec4899", "#f472b6", "#fbcfe8", "#a855f7", "#fbbf24", "#ffffff"],
};

function spawnConfetti(count = 120, charge = 0) {
  const colors = COLORS_BY_THEME[state.color] || COLORS_BY_THEME.purple;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.38;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * 360 * Math.PI) / 180;
    const speed = Math.random() * 14 + 4 + (charge * 18);
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

let gameState = {
  active: false,
  score: 0,
  level: 1,
  basketX: window.innerWidth / 2,
  basketWidth: 80,
  isExtreme: false
};
let rainInterval = null;
let extremeInterval = null;

function spawnRainItem() {
  const isStar = Math.random() < 0.05;
  const isMagnet = Math.random() < 0.03;
  const cx = Math.random() * window.innerWidth;
  const colors = COLORS_BY_THEME[state.color] || COLORS_BY_THEME.purple;
  
  const speedMult = gameState.level === 1 ? 1 : (gameState.level === 2 ? 1.2 : 1.4);
  
  let type = "normal";
  if (isStar) type = "star";
  else if (isMagnet) type = "magnet";

  confettiPieces.push({
    x: cx,
    y: -20,
    vx: (Math.random() - 0.5) * 1.5, // keep slight horizontal variance
    vy: 2.5 * speedMult, // Constant competitive drop speed
    color: colors[Math.floor(Math.random() * colors.length)],
    w: Math.random() * 10 + 6,
    h: Math.random() * 5 + 4,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 6,
    alpha: 1,
    shape: Math.random() > 0.5 ? "rect" : "circle",
    gravity: 0.08 * speedMult, // Constant competitive gravity
    drag: 0.98,
    type: type
  });
  
  if (!confettiRunning) {
    confettiRunning = true;
    animateConfetti();
  }
}

function spawnFireworkExplosion(x, y) {
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff"];
  const explodeColor = colors[Math.floor(Math.random()*colors.length)];
  for (let i = 0; i < 60; i++) {
    const angle = (Math.random() * 360 * Math.PI) / 180;
    const speed = Math.random() * 14 + 4;
    confettiPieces.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: explodeColor,
      w: 8, h: 8, rot: 0, rotSpeed: 0, alpha: 1, shape: "circle", gravity: 0.1, drag: 0.94, type: "sparks"
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    animateConfetti();
  }
}

function triggerMegaCelebration() {
  gameState.isExtreme = true;
  document.body.classList.add("rave-bg", "extreme-shake");
  
  let bursts = 0;
  extremeInterval = setInterval(() => {
    const cx = Math.random() * window.innerWidth;
    const cy = Math.random() * (window.innerHeight * 0.8);
    spawnFireworkExplosion(cx, cy);
    triggerConfetti(0.8);
    playPopSound(1.0);
    bursts++;
    if (bursts > 30) {
      clearInterval(extremeInterval);
      document.body.classList.remove("rave-bg", "extreme-shake");
      endGame(true);
    }
  }, 200);
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState.active) {
    gameState.basketX = Math.max(gameState.basketWidth/2, Math.min(canvas.width - gameState.basketWidth/2, gameState.basketX));

    ctx.save();
    ctx.translate(gameState.basketX, canvas.height - 100);
    ctx.font = gameState.basketWidth > 100 ? "80px system-ui" : "50px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🪣", 0, 0);
    ctx.restore();
  }

  confettiPieces = confettiPieces.filter((p) => p.alpha > 0.02);

  confettiPieces.forEach((p) => {
    p.vy += p.gravity;
    p.vx += windX;
    p.vy += windY;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.rotSpeed;

    if (gameState.active && p.alpha > 0 && p.type !== "sparks") {
      const basketY = canvas.height - 100;
      if (Math.abs(p.x - gameState.basketX) < gameState.basketWidth / 2 && Math.abs(p.y - basketY) < 25) {
        p.alpha = 0;
        
        if (p.type === "star") {
          gameState.score += 5;
        } else if (p.type === "magnet") {
          gameState.score += 1;
          gameState.basketWidth = 140;
          setTimeout(() => gameState.basketWidth = 80, 5000);
        } else {
          gameState.score += 1;
        }
        
        if (gameState.score >= 100 && !gameState.isExtreme) {
          clearInterval(rainInterval);
          $("gameScore").innerText = gameState.score;
          triggerMegaCelebration();
        } else if (gameState.score >= 60 && gameState.level < 3) {
          gameState.level = 3;
        } else if (gameState.score >= 25 && gameState.level < 2) {
          gameState.level = 2;
        }
        
        if (!gameState.isExtreme) {
          $("gameScore").innerText = gameState.score;
          $("gameLevel").innerText = gameState.level;
        }
      }
    }

    if (p.y > canvas.height + 20) {
      p.alpha = 0;
      return;
    }
    if (p.y > canvas.height * 0.6) p.alpha -= 0.012;

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    
    if (p.type === "star") {
      ctx.font = "30px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⭐", 0, 0);
    } else if (p.type === "magnet") {
      ctx.font = "30px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🧲", 0, 0);
    } else {
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
    }
    ctx.restore();
  });

  if (confettiPieces.length > 0) {
    animFrame = requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
  }
}

function triggerConfetti(charge = 0) {
  if (animFrame) cancelAnimationFrame(animFrame);
  spawnConfetti(Math.floor(140 + charge * 200), charge);
  confettiRunning = true;
  animateConfetti();

  // Extra burst after 300ms
  setTimeout(() => spawnConfetti(Math.floor(60 + charge * 80), charge), 300);
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
function playPopSound(charge = 0) {
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
    osc.frequency.setValueAtTime(180 + charge * 100, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60 + charge * 40, ac.currentTime + 0.15);
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

function doPop(charge = 0) {
  if (state.popped) {
    // Allow re-popping with more confetti
    popperEmoji.textContent = randomEmoji();
    triggerConfetti(charge);
    playPopSound(charge);
    return;
  }

  state.popped = true;
  popperBtn.classList.add("popped");
  popperEmoji.textContent = randomEmoji();
  pressHint.classList.add("hidden");

  playPopSound(charge);
  triggerConfetti(charge);
  flashBackground();

  // Show message
  setTimeout(() => messageWrap.classList.add("visible"), 400);

  // Vibrate on mobile
  if (navigator.vibrate) navigator.vibrate([30, 50, 80, 50, 200]);
}

// ─────────────────────────────────────────────
// 10. Charge-to-pop logic & Wind
// ─────────────────────────────────────────────
let chargeStartTime = 0;
let chargeAnimFrame = null;
let currentCharge = 0;

function startCharge(e) {
  if (e && e.type === "touchstart") e.preventDefault();
  
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission().catch(() => {});
  }

  chargeStartTime = performance.now();
  popperBtn.classList.add("charging");
  
  function chargeLoop(time) {
    const elapsed = time - chargeStartTime;
    currentCharge = Math.min(elapsed / 1500, 1.0);
    popperBtn.style.setProperty("--charge", currentCharge);
    chargeAnimFrame = requestAnimationFrame(chargeLoop);
  }
  chargeAnimFrame = requestAnimationFrame(chargeLoop);
}

function stopCharge(e) {
  if (e && e.type === "touchend") e.preventDefault();
  if (!chargeAnimFrame) return; // wasn't charging
  
  cancelAnimationFrame(chargeAnimFrame);
  chargeAnimFrame = null;
  popperBtn.classList.remove("charging");
  popperBtn.style.removeProperty("--charge");
  
  doPop(currentCharge);
  currentCharge = 0;
}

popperBtn.addEventListener("pointerdown", startCharge);
window.addEventListener("pointerup", stopCharge);
window.addEventListener("pointercancel", stopCharge);

window.addEventListener("deviceorientation", (e) => {
  if (e.gamma === null || e.beta === null) return;
  windX = e.gamma * 0.015;
  windY = (e.beta - 45) * 0.015;
});

window.addEventListener("mousemove", (e) => {
  if (gameState.active) {
    gameState.basketX = e.clientX;
  } else {
    if (window.DeviceOrientationEvent && windX !== 0) return; // prefer device
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    windX = (e.clientX - cx) * 0.0003;
    windY = (e.clientY - cy) * 0.0003;
  }
});

window.addEventListener("touchmove", (e) => {
  if (gameState.active && e.touches.length > 0) {
    gameState.basketX = e.touches[0].clientX;
  }
});

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
// 12. Game Mode Logic
// ─────────────────────────────────────────────
const playGameBtn = $("playGameBtn");
const exitGameBtn = $("exitGameBtn");
const gameHud = $("gameHud");
const gameOverOverlay = $("gameOverOverlay");
const finalScoreDisplay = $("finalScoreDisplay");
const playAgainBtn = $("playAgainBtn");
const exitToHomeBtn = $("exitToHomeBtn");

function startGame() {
  gameState.active = true;
  gameState.score = 0;
  gameState.level = 1;
  gameState.isExtreme = false;
  gameState.basketWidth = 80;
  gameState.basketX = window.innerWidth / 2;
  $("gameScore").innerText = "0";
  $("gameLevel").innerText = "1";
  
  body.classList.add("game-active");
  gameHud.classList.remove("hidden");
  gameOverOverlay.classList.remove("open");
  
  if (rainInterval) clearInterval(rainInterval);
  rainInterval = setInterval(() => {
    if (gameState.active && !gameState.isExtreme) {
      const drops = gameState.level === 3 ? 6 : (gameState.level === 2 ? 4 : 2); // Increased drops
      for(let i=0; i<drops; i++) spawnRainItem();
    }
  }, 200); // Shorter interval (faster spawn rate)
}

function endGame(won = false) {
  gameState.active = false;
  clearInterval(rainInterval);
  if (extremeInterval) clearInterval(extremeInterval);
  finalScoreDisplay.innerText = gameState.score;
  $("gameOverTitle").innerText = won ? "YOU WIN! 🎇" : "Game Over";
  gameOverOverlay.classList.add("open");
}

function exitGame() {
  gameState.active = false;
  clearInterval(rainInterval);
  if (extremeInterval) clearInterval(extremeInterval);
  body.classList.remove("game-active");
  document.body.classList.remove("rave-bg", "extreme-shake");
  gameHud.classList.add("hidden");
  gameOverOverlay.classList.remove("open");
}

playGameBtn.addEventListener("click", startGame);
exitGameBtn.addEventListener("click", exitGame);
playAgainBtn.addEventListener("click", startGame);
exitToHomeBtn.addEventListener("click", exitGame);
