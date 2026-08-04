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

  await Promise.all([
    loadComponent("#Header", `${root}/components/header.html`),
    loadComponent("#Footer", `${root}/components/footer.html`)
  ]);

  document.querySelectorAll("[data-path]").forEach((link) => {
    link.href = `${root}/${link.dataset.path}`;
  });

  initializeMenu();
  initializeTheme();
  initializePreviews();
  initializeKeyboardNavigation();
}

initializeSite();

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: MENU */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeMenu() {
  const menu = document.querySelector("#Menu");

  menu.addEventListener("click", () => {
    const isOpen = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!isOpen));
  });
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: THEME */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function initializeTheme() {
  const theme = document.querySelector("#Theme");

  theme.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("Light");
    theme.setAttribute("aria-pressed", String(isLight));
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

    if (event.key === "Escape" && isNavigationLink) {
      event.preventDefault();
      menu.setAttribute("aria-expanded", "false");
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
}

/* !SECTION */