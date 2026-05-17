// NOTE: MAIN ROOT JS

function getCssValue(variableName) {
     return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

function getCssNumber(variableName, fallback = 0) {
     const rawValue = getCssValue(variableName);
     const value = parseFloat(rawValue);
     return Number.isNaN(value) ? fallback : value;
}

function getCssColor(variableName, fallback = "#ffffff") {
     const value = getCssValue(variableName);
     return value || fallback;
}

function getSparkleSettings() {
     return {
          countMax: getCssNumber("--sparkle-count-max", 180),
          sizeMin: getCssNumber("--sparkle-size-min", 16),
          sizeMax: getCssNumber("--sparkle-size-max", 26),
          speedMin: getCssNumber("--sparkle-speed-min", 0.2),
          speedMax: getCssNumber("--sparkle-speed-max", 0.7),
          density: getCssNumber("--sparkle-density", 0.00015),
          wobbleSpeedMin: getCssNumber("--sparkle-wobble-speed-min", 0.005),
          wobbleSpeedMax: getCssNumber("--sparkle-wobble-speed-max", 0.02),
          wobbleAmountMin: getCssNumber("--sparkle-wobble-amount-min", 5),
          wobbleAmountMax: getCssNumber("--sparkle-wobble-amount-max", 15),
          opacityMin: getCssNumber("--sparkle-opacity-min", 0.2),
          opacityMax: getCssNumber("--sparkle-opacity-max", 1),
          respawnOffsetTop: getCssNumber("--sparkle-respawn-offset-top", -20),
          respawnOffsetBottom: getCssNumber("--sparkle-respawn-offset-bottom", 24)
     };
}

function getSparklePalette() {
     return ["#ffffff"];
}

//====================================================================================================
/* RAINBOW */
//====================================================================================================

function randomNumber(min, max) {
     return Math.random() * (max - min) + min;
}

function randomWholeNumber(min, max) {
     return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
     return array[randomWholeNumber(0, array.length - 1)];
}

function randomItemExcept(array, previousItem) {
     if (!array.length) {
          return undefined;
     }

     if (array.length === 1) {
          return array[0];
     }

     let nextItem = randomItem(array);

     while (nextItem === previousItem) {
          nextItem = randomItem(array);
     }

     return nextItem;
}

function shuffleArray(array) {
     const shuffled = [...array];

     for (let i = shuffled.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
     }

     return shuffled;
}

function createColorEngine(colorsOrFactory) {
     // Shared color engine for marquee + sparkles, uses either an array of colors OR a function that returns an array of colors.

     let previousColor = null;
     // This remembers most recent single color used by .next().

     function resolvePalette() {
          const rawPalette = typeof colorsOrFactory === "function"
               ? colorsOrFactory()
               : colorsOrFactory;

          if (!Array.isArray(rawPalette)) {
               return [];
          }

          return rawPalette.filter(Boolean);
     }

     function avoidImmediateRepeatInBatch(colorBatch, previousColorForSlot, startIndex = 0) {
          if (colorBatch.length <= startIndex) {
               return;
          }

          if (colorBatch[startIndex] !== previousColorForSlot) {
               return;
          }

          let swapIndex = -1;

          for (let i = startIndex + 1; i < colorBatch.length; i += 1) {
               if (colorBatch[i] !== previousColorForSlot) {
                    swapIndex = i;
                    break;
               }
          }

          if (swapIndex !== -1) {
               const temp = colorBatch[startIndex];
               colorBatch[startIndex] = colorBatch[swapIndex];
               colorBatch[swapIndex] = temp;
          }
     }

     return {
          next() {
               const palette = resolvePalette();

               if (!palette.length) {
                    return undefined;
               }

               if (palette.length === 1) {
                    previousColor = palette[0];
                    return palette[0];
               }

               const nextColor = randomItemExcept(palette, previousColor);

               previousColor = nextColor;
               return nextColor;
          },

          nextCycle(count, previousCycleColors = []) {
               const palette = resolvePalette();

               if (!palette.length || count <= 0) {
                    return [];
               }

               if (palette.length === 1) {
                    return Array(count).fill(palette[0]);
               }

               const nextColors = [];
               let availableColors = shuffleArray(palette);
               let colorIndex = 0;

               for (let i = 0; i < count; i += 1) {
                    if (colorIndex >= availableColors.length) {
                         availableColors = shuffleArray(palette);
                         colorIndex = 0;
                    }

                    const previousColorForSlot = previousCycleColors[i] || null;

                    avoidImmediateRepeatInBatch(availableColors, previousColorForSlot, colorIndex);

                    const nextColor = availableColors[colorIndex];
                    colorIndex += 1;
                    nextColors.push(nextColor);
               }

               return nextColors;
          },

          nextCycleForText(text, previousCycleColors = []) {
               const palette = resolvePalette();

               if (!palette.length || !text) {
                    return [];
               }

               if (palette.length === 1) {
                    return Array(text.length).fill(palette[0]);
               }

               const nextColors = [];
               let usedColorsInWord = new Set();
               let availableColors = shuffleArray(palette);
               let colorIndex = 0;

               for (let i = 0; i < text.length; i += 1) {
                    const character = text[i];

                    if (/\s/.test(character)) {
                         usedColorsInWord.clear();
                         nextColors.push("");
                         continue;
                    }

                    if (usedColorsInWord.size >= palette.length) {
                         usedColorsInWord.clear();
                    }

                    let nextColor = null;
                    const previousColorForSlot = previousCycleColors[i] || null;

                    for (let attempts = 0; attempts < palette.length * 2; attempts += 1) {
                         if (colorIndex >= availableColors.length) {
                              availableColors = shuffleArray(palette);
                              colorIndex = 0;
                         }

                         avoidImmediateRepeatInBatch(availableColors, previousColorForSlot, colorIndex);

                         const candidateColor = availableColors[colorIndex];
                         colorIndex += 1;

                         if (!usedColorsInWord.has(candidateColor)) {
                              nextColor = candidateColor;
                              break;
                         }
                    }

                    if (!nextColor) {
                         const fallbackColors = palette.filter((color) => !usedColorsInWord.has(color));

                         nextColor = randomItemExcept(
                              fallbackColors.length ? fallbackColors : palette,
                              previousColorForSlot
                         );
                    }

                    usedColorsInWord.add(nextColor);
                    nextColors.push(nextColor);
               }

               return nextColors;
          },

          reset() {
               previousColor = null;
          }
     };
}

/* COLLAPSIBLE NAV MENU */

const navButton = document.querySelector(".nav-button");
const dropdownLow = document.querySelector(".dropdown-low");
const navMenu = document.getElementById("navMenu");
const navButtonOpen = navButton ? navButton.querySelector(".nav-button-open") : null;
const navButtonClose = navButton ? navButton.querySelector(".nav-button-close") : null;

function syncNavButtonGlow() {
     if (!navButton) {
          return;
     }

     const currentColor = getCssColor("--color-white", "#ffffff");

     navButton.style.color = currentColor;
     navButton.style.webkitTextFillColor = "currentColor";
     navButton.style.textShadow = "none";

     if (navButtonOpen) {
          navButtonOpen.style.textShadow = "none";
     }

     if (navButtonClose) {
          navButtonClose.style.textShadow = "none";
     }
}

function openMenu() {
     if (!dropdownLow || !navButton) {
          return;
     }

     dropdownLow.classList.add("menu-open");
     navButton.setAttribute("aria-expanded", "true");
     syncNavButtonGlow();
}

function closeMenu() {
     if (!dropdownLow || !navButton) {
          return;
     }

     dropdownLow.classList.remove("menu-open");
     navButton.setAttribute("aria-expanded", "false");
     syncNavButtonGlow();
}

function toggleMenu() {
     if (!dropdownLow) {
          return;
     }

     if (dropdownLow.classList.contains("menu-open")) {
          closeMenu();
     } else {
          openMenu();
     }
}

if (navButton && dropdownLow) {
     navButton.addEventListener("click", function (event) {
          event.stopPropagation();
          toggleMenu();
     });

     navButton.addEventListener("mouseenter", function () {
          syncNavButtonGlow();
     });

     navButton.addEventListener("mouseleave", function () {
          syncNavButtonGlow();
     });

     navButton.addEventListener("focus", function () {
          syncNavButtonGlow();
     });

     navButton.addEventListener("blur", function () {
          syncNavButtonGlow();
     });
}

document.addEventListener("click", function (event) {
     if (!navButton || !dropdownLow) {
          return;
     }

     const clickedInsideDropdown = dropdownLow.contains(event.target);

     if (!clickedInsideDropdown) {
          closeMenu();
     }
});

document.addEventListener("keydown", function (event) {
     if (event.key === "Escape") {
          closeMenu();
          closeProjectPopup();
     }
});

//====================================================================================================
/* NOTE: MARQUEE */
//====================================================================================================

const marqueeElements = Array.from(document.querySelectorAll(".marquee"));

const marqueeItems = marqueeElements.map(function (element) {
     const lineNodes = Array.from(element.querySelectorAll(".marquee-word, .marquee-break"));

     return {
          element: element,
          lineNodes: lineNodes,
          lineLetterSpans: [],
          visibleSpans: [],
          previousColorsByLine: []
     };
});

let headerColorCycleTimer = null;
let marqueeColorEngine = null;
let accentColorEngine = null;

/* MARQUEE FIT */
/* Marquee size gets reduced until longest line fits available width. */
/* Existing line structure is preserved here, so first name and last name stay stacked. */

function getMarqueeFitSettings() {
     const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

     return {
          maxFontSize: 4 * rootFontSize,
          minFontSize: 0.5 * rootFontSize,
          step: 1
     };
}

function resetMarqueeFitSize(marqueeElement) {
     if (!marqueeElement) {
          return;
     }

     marqueeElement.style.removeProperty("--marquee-fit-size");
}

function fitMarqueeToContainer(marqueeElement) {
     if (!marqueeElement) {
          return;
     }

     const fitSettings = getMarqueeFitSettings();

     resetMarqueeFitSize(marqueeElement);
     marqueeElement.style.setProperty("--marquee-fit-size", `${fitSettings.maxFontSize}px`);

     let currentSize = fitSettings.maxFontSize;

     while (currentSize > fitSettings.minFontSize) {
          const marqueeTooWide = marqueeElement.scrollWidth > marqueeElement.clientWidth;

          if (!marqueeTooWide) {
               break;
          }

          currentSize -= fitSettings.step;
          marqueeElement.style.setProperty("--marquee-fit-size", `${currentSize}px`);
     }
}

function fitAllMarquees() {
     if (!marqueeItems.length) {
          return;
     }

     for (let i = 0; i < marqueeItems.length; i += 1) {
          fitMarqueeToContainer(marqueeItems[i].element);
     }
}

function setMarqueeTextToSolidColor(color) {
     if (!marqueeItems.length || !color) {
          return;
     }

     for (let i = 0; i < marqueeItems.length; i += 1) {
          const marqueeItem = marqueeItems[i];

          marqueeItem.element.style.color = color;
          marqueeItem.element.style.textShadow = "none";

          for (let lineIndex = 0; lineIndex < marqueeItem.lineNodes.length; lineIndex += 1) {
               marqueeItem.lineNodes[lineIndex].style.color = color;
               marqueeItem.lineNodes[lineIndex].style.textShadow = "none";
          }
     }
}

function buildMarqueeSpans(marqueeItem) {
     if (!marqueeItem || !marqueeItem.element || !marqueeItem.lineNodes.length) {
          return;
     }

     marqueeItem.lineLetterSpans = [];
     marqueeItem.visibleSpans = [];
     marqueeItem.previousColorsByLine = [];

     for (let i = 0; i < marqueeItem.lineNodes.length; i += 1) {
          const lineNode = marqueeItem.lineNodes[i];
          const originalText = lineNode.textContent.trim();

          lineNode.innerHTML = "";

          const letterSpans = [];

          for (let j = 0; j < originalText.length; j += 1) {
               const char = originalText[j];
               const span = document.createElement("span");

               span.textContent = char === " " ? "\u00A0" : char;
               span.style.display = "inline-block";

               lineNode.appendChild(span);
               letterSpans.push(span);

               if (span.textContent !== "\u00A0") {
                    marqueeItem.visibleSpans.push(span);
               }
          }

          marqueeItem.lineLetterSpans.push(letterSpans);
          marqueeItem.previousColorsByLine.push([]);
     }
}

//====================================================================================================
/* NOTE: CANVAS */
//====================================================================================================

const siteBgCanvas = document.getElementById("siteBgCanvas");
const siteBgCtx = siteBgCanvas ? siteBgCanvas.getContext("2d") : null;

const bgParticles = [];
let bgWidth = 0;
let bgHeight = 0;
let bgParticleCount = 0;
let resizeTimer = null;

let sparkleColorEngine = null;

function resizeBgCanvasFromCss(canvas) {
     if (!canvas) {
          return;
     }

     const rect = canvas.getBoundingClientRect();
     const dpr = window.devicePixelRatio || 1;

     canvas.width = Math.round(rect.width * dpr);
     canvas.height = Math.round(rect.height * dpr);

     const ctx = canvas.getContext("2d");

     if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
     }

     bgWidth = rect.width;
     bgHeight = rect.height;
}

function setBgParticleCount() {
     const sparkleSettings = getSparkleSettings();
     const screenArea = bgWidth * bgHeight;

     bgParticleCount = Math.min(
          sparkleSettings.countMax,
          Math.floor(screenArea * sparkleSettings.density)
     );
}

function createBgParticle(startAboveScreen = false) {
     const sparkleSettings = getSparkleSettings();
     const x = Math.random() * bgWidth;

     if (!sparkleColorEngine) {
          sparkleColorEngine = createColorEngine(getSparklePalette);
     }

     return {
          x: x,
          baseX: x,
          y: startAboveScreen
               ? sparkleSettings.respawnOffsetTop
               : Math.random() * bgHeight,
          char: Math.random() < 0.5 ? "✦\uFE0E" : "✧\uFE0E",
          color: sparkleColorEngine.next() || getCssColor("--color-white", "#ffffff"),
          size: randomNumber(sparkleSettings.sizeMin, sparkleSettings.sizeMax),
          speed: randomNumber(sparkleSettings.speedMin, sparkleSettings.speedMax),
          wobbleOffset: randomNumber(0, Math.PI * 2),
          wobbleSpeed: randomNumber(sparkleSettings.wobbleSpeedMin, sparkleSettings.wobbleSpeedMax),
          wobbleAmount: randomNumber(sparkleSettings.wobbleAmountMin, sparkleSettings.wobbleAmountMax),
          opacity: randomNumber(sparkleSettings.opacityMin, sparkleSettings.opacityMax)
     };
}

function initBgParticles(count) {
     bgParticles.length = 0;

     for (let i = 0; i < count; i += 1) {
          bgParticles.push(createBgParticle());
     }
}

function setupSparkleRain() {
     if (!siteBgCanvas || !siteBgCtx) {
          return;
     }

     sparkleColorEngine = createColorEngine(getSparklePalette);

     resizeBgCanvasFromCss(siteBgCanvas);
     setBgParticleCount();
     initBgParticles(bgParticleCount);
}

function updateBgParticles() {
     const sparkleSettings = getSparkleSettings();

     for (let i = 0; i < bgParticles.length; i += 1) {
          const p = bgParticles[i];

          p.y += p.speed;
          p.wobbleOffset += p.wobbleSpeed;
          p.x = p.baseX + Math.sin(p.wobbleOffset) * p.wobbleAmount;

          if (p.y > bgHeight + sparkleSettings.respawnOffsetBottom) {
               bgParticles[i] = createBgParticle(true);
          }
     }
}

function drawBackground() {
     if (!siteBgCtx) {
          return;
     }

     siteBgCtx.clearRect(0, 0, bgWidth, bgHeight);
}

function drawBgParticles() {
     if (!siteBgCtx) {
          return;
     }

     for (let i = 0; i < bgParticles.length; i += 1) {
          const p = bgParticles[i];

          siteBgCtx.save();
          siteBgCtx.globalAlpha = p.opacity;
          siteBgCtx.font = `${p.size}px "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", "Noto Sans Symbols", sans-serif`;
          siteBgCtx.textAlign = "center";
          siteBgCtx.textBaseline = "middle";
          siteBgCtx.fillStyle = p.color;
          siteBgCtx.shadowBlur = 0;
          siteBgCtx.shadowColor = "transparent";
          siteBgCtx.fillText(p.char, p.x, p.y);
          siteBgCtx.restore();
     }
}

function drawSparkleRain() {
     if (!siteBgCanvas || !siteBgCtx) {
          return;
     }

     drawBackground();
     updateBgParticles();
     drawBgParticles();

     window.requestAnimationFrame(drawSparkleRain);
}

//====================================================================================================
/* NOTE: PROJECT POPUP */
//====================================================================================================

let projectPopup = null;
let projectPopupTitlebar = null;
let projectPopupTitle = null;
let projectPopupOpenButton = null;
let projectPopupCloseButton = null;
let projectPopupBody = null;

function getProjectPopup() {
     if (projectPopup) {
          return projectPopup;
     }

     projectPopup = document.createElement("div");
     projectPopup.className = "project-popup";
     projectPopup.setAttribute("role", "dialog");
     projectPopup.setAttribute("aria-modal", "true");
     projectPopup.setAttribute("aria-hidden", "true");

     const frame = document.createElement("div");
     frame.className = "project-popup-frame";

     projectPopupTitlebar = document.createElement("div");
     projectPopupTitlebar.className = "project-popup-titlebar";

     projectPopupTitle = document.createElement("span");
     projectPopupTitle.className = "project-popup-title";

     const popupControls = document.createElement("span");
     popupControls.className = "project-popup-controls";

     projectPopupOpenButton = document.createElement("button");
     projectPopupOpenButton.className = "project-popup-control project-popup-control-open";
     projectPopupOpenButton.type = "button";
     projectPopupOpenButton.textContent = "□";
     projectPopupOpenButton.setAttribute("aria-label", "Open project in a new tab");

     projectPopupCloseButton = document.createElement("button");
     projectPopupCloseButton.className = "project-popup-control project-popup-control-close";
     projectPopupCloseButton.type = "button";
     projectPopupCloseButton.textContent = "x";
     projectPopupCloseButton.setAttribute("aria-label", "Close project preview popup");

     popupControls.append(projectPopupOpenButton, projectPopupCloseButton);
     projectPopupTitlebar.append(projectPopupTitle, popupControls);

     projectPopupBody = document.createElement("div");
     projectPopupBody.className = "project-popup-body";

     frame.append(projectPopupTitlebar, projectPopupBody);
     projectPopup.appendChild(frame);
     document.body.appendChild(projectPopup);

     projectPopup.addEventListener("click", function (event) {
          if (event.target === projectPopup) {
               closeProjectPopup();
          }
     });

     projectPopupOpenButton.addEventListener("click", function () {
          const projectUrl = projectPopupOpenButton.dataset.projectUrl;

          if (projectUrl) {
               window.open(projectUrl, "_blank", "noopener,noreferrer");
          }
     });

     projectPopupCloseButton.addEventListener("click", closeProjectPopup);

     return projectPopup;
}

function closeProjectPopup() {
     if (!projectPopup) {
          return;
     }

     projectPopup.classList.remove("is-open");
     projectPopup.setAttribute("aria-hidden", "true");
     projectPopupOpenButton.removeAttribute("data-project-url");
     projectPopupBody.replaceChildren();
}

function openProjectPopup(projectItem) {
     if (!projectItem) {
          return;
     }

     const preview = projectItem.querySelector(".project-preview");
     const projectCopy = projectItem.querySelector(".project-copy");
     const projectUrl = preview ? preview.getAttribute("href") : "";

     if (!preview) {
          return;
     }

     getProjectPopup();

     const popupPreview = preview.cloneNode(true);
     popupPreview.removeAttribute("href");
     popupPreview.removeAttribute("target");
     popupPreview.removeAttribute("rel");
     popupPreview.removeAttribute("aria-label");
     popupPreview.setAttribute("aria-hidden", "true");
     popupPreview.tabIndex = -1;

     projectPopupTitle.textContent = projectItem.dataset.title || "project.preview";

     if (projectUrl) {
          projectPopupOpenButton.disabled = false;
          projectPopupOpenButton.dataset.projectUrl = projectUrl;
     } else {
          projectPopupOpenButton.disabled = true;
          projectPopupOpenButton.removeAttribute("data-project-url");
     }

     if (projectCopy) {
          projectPopupBody.replaceChildren(popupPreview, projectCopy.cloneNode(true));
     } else {
          projectPopupBody.replaceChildren(popupPreview);
     }

     projectPopup.classList.add("is-open");
     projectPopup.setAttribute("aria-hidden", "false");
     projectPopupCloseButton.focus();
}

function setupProjectPopups() {
     const projectTitlebars = Array.from(document.querySelectorAll(".project-titlebar"));
     const projectPreviews = Array.from(document.querySelectorAll("a.project-preview"));

     for (let i = 0; i < projectTitlebars.length; i += 1) {
          projectTitlebars[i].addEventListener("click", function () {
               openProjectPopup(projectTitlebars[i].closest(".project-item"));
          });
     }

     document.addEventListener("pointerdown", function (event) {
          if (!event.target.closest(".project-item")) {
               for (let i = 0; i < projectTitlebars.length; i += 1) {
                    projectTitlebars[i].blur();
               }
          }
     });

     for (let i = 0; i < projectPreviews.length; i += 1) {
          projectPreviews[i].tabIndex = -1;
          projectPreviews[i].addEventListener("click", function (event) {
               event.preventDefault();
          });
     }
}

function setupScrollTopButton() {
     const scrollTopButton = document.querySelector(".scroll-top-button");

     if (!scrollTopButton) {
          return;
     }

     function updateScrollTopVisibility() {
          const pageHeight = Math.max(
               document.documentElement.scrollHeight,
               document.body.scrollHeight
          );

          scrollTopButton.hidden = pageHeight <= window.innerHeight + 1;
     }

     scrollTopButton.addEventListener("click", function (event) {
          event.preventDefault();

          window.scrollTo({
               top: 0,
               behavior: "smooth"
          });
     });

     updateScrollTopVisibility();
     window.addEventListener("load", updateScrollTopVisibility);
     window.addEventListener("resize", updateScrollTopVisibility);
}

/* SHARED HELPERS FOR GAME PAGES */
/* Expose reusable site-wide helpers so module files can reuse same CSS/theme/math logic instead of redefining it in every game file. */

if (!window.SiteTheme) {
     window.SiteTheme = {};
}

Object.assign(window.SiteTheme, {
     getCssValue,
     getCssNumber,
     getCssColor,
     getSparkleSettings,
     createColorEngine,
     randomNumber,
     randomWholeNumber,
     randomItem,
     randomItemExcept,
     shuffleArray,
     fitMarqueeToContainer,
     fitAllMarquees
});

/* STARTUP */

function handleResize() {
     window.clearTimeout(resizeTimer);

     resizeTimer = window.setTimeout(function () {
          setupSparkleRain();
          syncNavButtonGlow();
          fitAllMarquees();
          setMarqueeTextToSolidColor(getCssColor("--color-gray3", "gray"));
     }, 150);
}

for (let i = 0; i < marqueeItems.length; i += 1) {
     buildMarqueeSpans(marqueeItems[i]);
}

fitAllMarquees();
setMarqueeTextToSolidColor(getCssColor("--color-gray3", "gray"));
syncNavButtonGlow();
setupProjectPopups();
setupScrollTopButton();
closeMenu();

if (siteBgCanvas && siteBgCtx) {
     setupSparkleRain();
     drawSparkleRain();
     window.addEventListener("resize", handleResize);
}
