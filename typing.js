function initializeTyping() {
  const heading = document.querySelector("#Typing");

  if (!heading) {
    return;
  }

  const text = heading.textContent.replace(/_$/, "");
  const typedText = document.createElement("span");
  const cursor = document.createElement("span");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  heading.textContent = "";
  // Preserve the complete heading for screen readers while animating its visual text.
  heading.setAttribute("aria-label", text);

  typedText.setAttribute("aria-hidden", "true");
  cursor.setAttribute("aria-hidden", "true");
  cursor.classList.add("typing-cursor");
  cursor.textContent = "_";

  heading.append(typedText, cursor);

  // Show the complete heading immediately when reduced motion is requested.
  if (reducedMotion.matches) {
    typedText.textContent = text;
    return;
  }

  let characterIndex = 0;
  let hasPaused = false;

  // Use recursive timeouts so the first word break can have a longer pause.
  function typeNextCharacter() {
    const character = text[characterIndex];

    typedText.textContent += character;
    characterIndex += 1;

    if (characterIndex === text.length) {
      return;
    }

    let delay = 100;

    if (character === " " && !hasPaused) {
      delay = 600;
      hasPaused = true;
    }

    window.setTimeout(typeNextCharacter, delay);
  }

  window.setTimeout(typeNextCharacter, 100);
}

initializeTyping();
