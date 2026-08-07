/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: CANVAS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.inset = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.pointerEvents = "none";

document.body.appendChild(canvas);

function resizeCanvas() {
  // Scale the drawing buffer so particles remain sharp on high-density screens.
  const scale = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;

  context.setTransform(scale, 0, 0, scale, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: PARTICLES */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

const particles = [];

const colors = [
  "--red",
  "--orange",
  "--yellow",
  "--green",
  "--cyan",
  "--blue",
  "--violet",
  "--pink"
];

const symbols = ["✦", "✧", "·", "•"];

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: STORAGE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

const storageKey = "Rainburst";

// Save unfinished particles so the burst can continue after page navigation.
function saveRainburst() {
  if (particles.length === 0) {
    return;
  }

  sessionStorage.setItem(
    storageKey,
    JSON.stringify({
      particles: particles,
      savedAt: Date.now()
    })
  );
}

function restoreRainburst() {
  const savedRainburst = sessionStorage.getItem(storageKey);

  if (!savedRainburst) {
    return;
  }

  sessionStorage.removeItem(storageKey);

  const saved = JSON.parse(savedRainburst);
  const isRecent = Date.now() - saved.savedAt < 3000;

  if (!isRecent || saved.particles.length === 0) {
    return;
  }

  particles.push(...saved.particles);
  requestAnimationFrame(animateRainburst);
}

window.addEventListener("pagehide", saveRainburst);

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: CREATION */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function getColors() {
  const styles = getComputedStyle(document.documentElement);

  return colors.map((color) => styles.getPropertyValue(color).trim());
}

function createRainburst(x, y) {
  const palette = getColors();

  for (let index = 0; index < 15; index++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.75 + Math.random() * 3;

    particles.push({
      x: x,
      y: y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: 18 + Math.random() * 14,
      life: 1,
      color: palette[Math.floor(Math.random() * palette.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    });
  }
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: ANIMATION */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function animateRainburst() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Iterate backward so expired particles can be removed without skipping others.
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];

    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.dy += 0.015;
    particle.size += 0.05;
    particle.life -= 0.008;

    if (particle.life <= 0) {
      particles.splice(index, 1);
      continue;
    }

    context.save();
    context.globalAlpha = particle.life;
    context.fillStyle = particle.color;
    context.shadowColor = particle.color;
    context.shadowBlur = 10;
    context.font = `${particle.size}px Annotation Mono`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(particle.symbol, particle.x, particle.y);
    context.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(animateRainburst);
  }
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: INPUT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

document.addEventListener("pointerdown", (event) => {
  if (reducedMotion.matches || !event.isPrimary) {
    return;
  }

  // Start one animation loop instead of creating another loop for every click.
  const animationWasStopped = particles.length === 0;

  createRainburst(event.clientX, event.clientY);

  if (animationWasStopped) {
    requestAnimationFrame(animateRainburst);
  }
});

restoreRainburst();

/* !SECTION */
