function initializeRainbow() {
  const heading = document.querySelector("h1");

  if (!heading) {
    return;
  }

  const colorNames = [
    "--red",
    "--orange",
    "--yellow",
    "--green",
    "--cyan",
    "--blue",
    "--violet",
    "--pink"
  ];

  const colors = colorNames.map((colorName) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(colorName)
      .trim();
  });

  const text = heading.textContent;
  const letters = [];

  heading.textContent = "";
  heading.setAttribute("aria-label", text);

  Array.from(text).forEach((character) => {
    const letter = document.createElement("span");

    letter.textContent = character === " " ? "\u00A0" : character;
    letter.setAttribute("aria-hidden", "true");

    heading.appendChild(letter);
    letters.push(letter);
  });

  let cycle = 0;

  function updateRainbow() {
    letters.forEach((letter, index) => {
      const colorIndex = (index + cycle) % colors.length;
      letter.style.color = colors[colorIndex];
    });
  }

  updateRainbow();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (!reducedMotion.matches) {
    window.setInterval(() => {
      cycle += 1;
      updateRainbow();
    }, 500);
  }
}

initializeRainbow();