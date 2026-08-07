/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: COMPONENTS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

async function loadComponent(selector, file) {
  const response = await fetch(file);
  const html = await response.text();
  document.querySelector(selector).innerHTML = html;
}

async function initializeSite() {
  const root = document.body.dataset.root;

  restorePreferences();

  // Load both shared components before initializing controls that depend on them.
  await Promise.all([
    loadComponent("#Header", `${root}/components/header.html`),
    loadComponent("#Footer", `${root}/components/footer.html`)
  ]);

  document.querySelectorAll("[data-path]").forEach((link) => {
    link.href = `${root}/${link.dataset.path}`;
  });


  initializeCurrentPage();
  initializeMenu();
  initializeText();
  initializeTheme();
  initializeGrayscale();
  initializePreviews();
  initializeKeyboardNavigation();
}

initializeSite();

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: PREFERENCES */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function restorePreferences() {
  const savedTheme = localStorage.getItem("Theme");
  const savedGrayscale = localStorage.getItem("Grayscale");
  const savedText = localStorage.getItem("Text");

  if (savedTheme === "Light") {
    document.body.classList.add("Light");
  }

  if (savedGrayscale === "true") {
    document.documentElement.classList.add("Grayscale");
  }

  if (savedText === "Small" || savedText === "Large") {
    document.documentElement.classList.add(savedText);
  }
}
/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: CURRENT PAGE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeCurrentPage() {
  // Normalize directory URLs so they match links ending in index.html.
  function normalizePath(path) {
    return path.endsWith("/") ? `${path}index.html` : path;
  }

  const currentPath = normalizePath(window.location.pathname);
  const pageLinks = document.querySelectorAll("[data-path]");

  pageLinks.forEach((link) => {
    const linkPath = normalizePath(new URL(link.href).pathname);

    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: MENU */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function setMenuOpen(menu, isOpen) {
  menu.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("MenuOpen", isOpen);
}

function initializeMenu() {
  const menu = document.querySelector("#Menu");
  const header = document.querySelector("header");
  const desktop = window.matchMedia("(min-width: 50rem)");

  menu.addEventListener("click", () => {
    const isOpen = menu.getAttribute("aria-expanded") === "true";
    setMenuOpen(menu, !isOpen);
  });

  document.addEventListener("click", (event) => {
    const isOpen = menu.getAttribute("aria-expanded") === "true";

    if (isOpen && !header.contains(event.target)) {
      setMenuOpen(menu, false);
    }
  });

  desktop.addEventListener("change", (event) => {
    if (event.matches) {
      setMenuOpen(menu, false);
    }
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: TEXT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeText() {
  const text = document.querySelector("#Text");
  const sizes = ["Small", "Medium", "Large"];

  let currentSize = localStorage.getItem("Text");

  if (!sizes.includes(currentSize)) {
    currentSize = "Medium";
  }

  function updateLabel() {
    const currentIndex = sizes.indexOf(currentSize);
    // Wrap from the final text size back to the first.
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextSize = sizes[nextIndex];

    text.setAttribute(
      "aria-label",
      `Text size: ${currentSize}. Change to ${nextSize}`
    );
  }

  updateLabel();

  text.addEventListener("click", () => {
    const currentIndex = sizes.indexOf(currentSize);
    const nextIndex = (currentIndex + 1) % sizes.length;

    currentSize = sizes[nextIndex];

    document.documentElement.classList.remove("Small", "Large");

    if (currentSize !== "Medium") {
      document.documentElement.classList.add(currentSize);
    }

    localStorage.setItem("Text", currentSize);
    updateLabel();
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: GRAYSCALE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeGrayscale() {
  const grayscale = document.querySelector("#Grayscale");

  const isGrayscale =
    document.documentElement.classList.contains("Grayscale");

  grayscale.setAttribute("aria-pressed", String(isGrayscale));

  grayscale.addEventListener("click", () => {
    const isGrayscale =
      document.documentElement.classList.toggle("Grayscale");

    grayscale.setAttribute("aria-pressed", String(isGrayscale));
    localStorage.setItem("Grayscale", String(isGrayscale));
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: THEME */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeTheme() {
  const theme = document.querySelector("#Theme");

  const isLight = document.body.classList.contains("Light");
  theme.setAttribute("aria-pressed", String(isLight));

  theme.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("Light");

    theme.setAttribute("aria-pressed", String(isLight));
    localStorage.setItem("Theme", isLight ? "Light" : "Dark");
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: PREVIEWS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializePreviews() {
  const preview = document.querySelector("#Preview");
  const previewLinks = document.querySelectorAll("[data-preview]");

  function showPreview(link) {
    const root = document.body.dataset.root;

    preview.src = `${root}/${link.dataset.preview}`;
    preview.hidden = false;
  }

  function movePreview(x, y) {
    preview.style.left = `${x}px`;
    preview.style.top = `${y}px`;
  }

  function hidePreview() {
    preview.hidden = true;
    preview.src = "";
  }

  previewLinks.forEach((link) => {
    link.addEventListener("mouseenter", (event) => {
      showPreview(link);
      movePreview(event.clientX, event.clientY);
    });

    link.addEventListener("mousemove", (event) => {
      movePreview(event.clientX, event.clientY);
    });

    link.addEventListener("mouseleave", hidePreview);

    link.addEventListener("focus", () => {
      const position = link.getBoundingClientRect();

      showPreview(link);
      movePreview(
        position.left + position.width / 2,
        position.top
      );
    });

    link.addEventListener("blur", hidePreview);
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: KEYBOARD NAV */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeKeyboardNavigation() {
  const menu = document.querySelector("#Menu");
  const navigation = document.querySelector("header nav");
  const main = document.querySelector("main");

  document.addEventListener("keydown", (event) => {
    const currentLink = document.activeElement;

    const isNavigationLink =
      currentLink instanceof HTMLAnchorElement &&
      navigation.contains(currentLink);

    const isMenuOpen = menu.getAttribute("aria-expanded") === "true";

    if (event.key === "Escape" && (isNavigationLink || isMenuOpen)) {
      event.preventDefault();
      setMenuOpen(menu, false);

      if (isNavigationLink) {
        main.focus();
      } else {
        menu.focus();
      }

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
    // Wrap keyboard navigation between the first and last links.
    const nextIndex = (currentIndex + direction + links.length) % links.length;

    links[nextIndex].focus();
  });
}

/* !SECTION */
