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


  document.querySelector(".title-navigation").insertBefore(
    document.querySelector("main h1"), document.querySelector("#NextPage")
  );

  initializeCurrentPage();
  initializePageNavigation();
  initializeText();
  initializeTheme();
  initializeGrayscale();
  initializeStars();
  initializePreviews();
  initializeKeyboardNavigation();
  initializeHeaderTooltips();
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

  if (savedText === "Large") {
    document.documentElement.classList.add(savedText);
  }
}
/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: CURRENT PAGE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

// Normalize directory URLs so they match links ending in index.html.
function normalizePath(path) {
  return path.endsWith("/") ? `${path}index.html` : path;
}

function initializeCurrentPage() {
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
/* SECTION: PAGE NAVIGATION */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializePageNavigation() {
  const root = document.body.dataset.root;
  const pages = [
    { path: "index.html", title: "Home" },
    { path: "pages/learning.html", title: "Certifications" },
    { path: "pages/projects.html", title: "Builds" }
  ];
  const currentPath = normalizePath(window.location.pathname);
  const currentIndex = pages.findIndex((page) =>
    new URL(`${root}/${page.path}`, window.location.href).pathname === currentPath
  );
  if (currentIndex < 0) return;

  for (const [id, offset, direction] of [
    ["PreviousPage", -1, "Previous"],
    ["NextPage", 1, "Next"]
  ]) {
    const page = pages[(currentIndex + offset + pages.length) % pages.length];
    const link = document.getElementById(id);
    link.href = `${root}/${page.path}`;
    link.setAttribute("aria-label", `${direction}: ${page.title}`);
  }
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: TEXT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeText() {
  const text = document.querySelector("#Text");
  let isLarge = localStorage.getItem("Text") === "Large";

  function updateTextSize() {
    document.documentElement.classList.remove("Small");
    document.documentElement.classList.toggle("Large", isLarge);
    localStorage.setItem("Text", isLarge ? "Large" : "Default");
    const label = isLarge ? "Use small text" : "Use large text";
    text.setAttribute("aria-label", label);

  }

  updateTextSize();

  text.addEventListener("click", () => {
    isLarge = !isLarge;
    updateTextSize();
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: DISPLAY CONTROLS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeStars() {
  const button = document.querySelector("#Stars");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function updateButton() {
    const enabled = localStorage.getItem("Stars") !== "false";
    button.setAttribute("aria-pressed", String(enabled && !motion.matches));
    button.disabled = motion.matches;
    button.setAttribute("aria-label", motion.matches
      ? "Background stars are off because reduced motion is enabled"
      : enabled ? "Background off" : "Background on");
  }

  button.addEventListener("click", () => {
    const enabled = localStorage.getItem("Stars") !== "false";
    localStorage.setItem("Stars", String(!enabled));
    updateButton();
    window.dispatchEvent(new Event("starschange"));
  });
  motion.addEventListener("change", updateButton);
  window.addEventListener("pageshow", updateButton);
  window.addEventListener("storage", updateButton);
  updateButton();
}

function initializeGrayscale() {
  const grayscale = document.querySelector("#Grayscale");

  function updateButton() {
    const isGrayscale = document.documentElement.classList.contains("Grayscale");
    grayscale.setAttribute("aria-pressed", String(isGrayscale));
    grayscale.setAttribute("aria-label", isGrayscale ? "Colors on" : "Colors off");
  }

  updateButton();
  grayscale.addEventListener("click", () => {
    const isGrayscale = document.documentElement.classList.toggle("Grayscale");
    localStorage.setItem("Grayscale", String(isGrayscale));
    updateButton();
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: THEME */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeTheme() {
  const theme = document.querySelector("#Theme");

  function updateButton() {
    const isLight = document.body.classList.contains("Light");
    theme.setAttribute("aria-pressed", String(isLight));
    theme.setAttribute("aria-label", isLight ? "Night mode" : "Day mode");
  }

  updateButton();
  theme.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("Light");
    localStorage.setItem("Theme", isLight ? "Light" : "Dark");
    updateButton();
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
  const navigation = document.querySelector("header");
  const main = document.querySelector("main");

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
    // Wrap keyboard navigation between the first and last links.
    const nextIndex = (currentIndex + direction + links.length) % links.length;

    links[nextIndex].focus();
  });
}

/* !SECTION */

function initializeHeaderTooltips() {
  const tooltip = document.createElement("div");
  tooltip.className = "header-tooltip";
  tooltip.id = "HeaderTooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.append(tooltip);
  let activeControl;
  let hideTimer;

  function hide() {
    tooltip.hidden = true;
    activeControl?.removeAttribute("aria-describedby");
    activeControl = null;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 100);
  }

  function show(control) {
    clearTimeout(hideTimer);
    activeControl?.removeAttribute("aria-describedby");
    activeControl = control;
    tooltip.textContent = control.getAttribute("aria-label");
    control.setAttribute("aria-describedby", tooltip.id);
    tooltip.hidden = false;
    const rect = control.getBoundingClientRect();
    const left = Math.max(8, Math.min(
      rect.left + (rect.width - tooltip.offsetWidth) / 2,
      window.innerWidth - tooltip.offsetWidth - 8
    ));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${rect.bottom + 6}px`;
  }

  document.querySelectorAll("header a, header button").forEach((control) => {
    control.removeAttribute("title");
    control.addEventListener("mouseenter", () => show(control));
    control.addEventListener("focus", () => show(control));
    control.addEventListener("mouseleave", scheduleHide);
    control.addEventListener("blur", scheduleHide);
    control.addEventListener("click", () => {
      if (activeControl === control) show(control);
    });
  });
  tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  tooltip.addEventListener("mouseleave", scheduleHide);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
  window.addEventListener("resize", hide);
  window.addEventListener("scroll", hide, true);
}
