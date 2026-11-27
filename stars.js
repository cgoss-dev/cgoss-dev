(() => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.className = "falling-stars";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colorNames = ["red", "orange", "yellow", "green", "cyan", "blue", "violet", "pink"];
  let stars = [];
  let width = 0;
  let height = 0;
  let frame = null;
  let previousTime = null;

  function createStar(aboveScreen = false) {
    return {
      x: Math.random() * width,
      y: aboveScreen ? -30 : Math.random() * height,
      symbol: Math.random() < 0.5 ? "✦" : "✧",
      colorIndex: Math.floor(Math.random() * colorNames.length),
      size: 16 + Math.random() * 10,
      speed: 12 + Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      drift: 0.3 + Math.random() * 0.9,
      sway: 5 + Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.5
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    stars = motion.matches ? [] : Array.from(
      { length: Math.min(180, Math.floor(width * height * 0.00015)) },
      () => createStar()
    );
  }

  function animate(time) {
    const elapsed = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    context.clearRect(0, 0, width, height);

    // Read the root palette so color changes apply without restarting the effect.
    const styles = getComputedStyle(document.body);
    const palette = colorNames.map(name => styles.getPropertyValue(`--${name}`).trim());
    context.textAlign = "center";
    context.textBaseline = "middle";

    stars.forEach((star, index) => {
      star.y += star.speed * elapsed;
      star.phase += star.drift * elapsed;
      if (star.y > height + 30) {
        stars[index] = createStar(true);
        return;
      }
      context.globalAlpha = star.opacity;
      context.fillStyle = palette[star.colorIndex];
      context.shadowColor = palette[star.colorIndex];
      context.shadowBlur = star.size * 0.65;
      context.font = `${star.size}px "Apple Symbols", "Segoe UI Symbol", sans-serif`;
      context.fillText(star.symbol, star.x + Math.sin(star.phase) * star.sway, star.y);
    });

    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
    const disabled = motion.matches || localStorage.getItem("Stars") === "false";
    canvas.hidden = disabled;
    if (disabled) {
      context.clearRect(0, 0, width, height);
    } else if (!document.hidden) {
      if (!stars.length) resize();
      frame = requestAnimationFrame(animate);
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("starschange", syncAnimation);
  window.addEventListener("storage", syncAnimation);
  motion.addEventListener("change", syncAnimation);
  document.addEventListener("visibilitychange", syncAnimation);
  window.addEventListener("pagehide", () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  });
  window.addEventListener("pageshow", syncAnimation);
  resize();
  syncAnimation();
})();
