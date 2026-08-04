const navigation = document.querySelector("header nav");
const main = document.querySelector("main");

/* ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: KEYBOARD NAV */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== ========== */
// Tab/Shift+Tab → normal browser navigation
// Left/Right    → move within header navigation
// Up/Down       → scroll the page normally
// Escape        → leave navigation and focus main
// Enter         → open the focused link

document.addEventListener("keydown", (event) => {
  const currentLink = document.activeElement;

  const isNavigationLink =
    currentLink instanceof HTMLAnchorElement &&
    navigation.contains(currentLink);

  if (event.key === "Escape" && isNavigationLink) {
    event.preventDefault();
    main.focus();
    return;
  }

  if (!isNavigationLink) {
    return;
  }

  let direction = 0;

  if (event.key === "ArrowRight") {
    direction = 1;
  }

  if (event.key === "ArrowLeft") {
    direction = -1;
  }

  if (direction === 0) {
    return;
  }

  event.preventDefault();

  const links = Array.from(navigation.querySelectorAll("a[href]"));
  const currentIndex = links.indexOf(currentLink);
  const nextIndex = (currentIndex + direction + links.length) % links.length;

  links[nextIndex].focus();
});
/* !SECTION */