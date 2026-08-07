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
  heading.setAttribute("aria-label", text);

  typedText.setAttribute("aria-hidden", "true");
  cursor.setAttribute("aria-hidden", "true");
  cursor.classList.add("typing-cursor");
  cursor.textContent = "_";

  heading.append(typedText, cursor);

  if (reducedMotion.matches) {
    typedText.textContent = text;
    return;
  }

  let characterIndex = 0;

  function typeNextCharacter() {
    const character = text[characterIndex];

    typedText.textContent += character;
    characterIndex += 1;

    if (characterIndex === text.length) {
      return;
    }

    const delay = character === " " ? 600 : 100;

    window.setTimeout(typeNextCharacter, delay);
  }

  window.setTimeout(typeNextCharacter, 100);
}

initializeTyping();
