// NOTE: SHARED SITE HEADER

const marqueeRainbowPalette = [
  "#f00",
  "#f80",
  "#ff0",
  "#bf0",
  "#0f0",
  "#0fb",
  "#0ff",
  "#0bf",
  "#00f",
  "#80f",
  "#f0f",
  "#f08",
];

const marqueeRainbowCycleMs = 240;
const marqueeRainbowLinks = [];
let marqueeRainbowTimer = null;
const renderedHeaders = [];
let navCompactFrame = null;

function buildMarqueeRainbow(marquee) {
  const text = marquee.textContent;
  const words = text.trim().split(/\s+/);

  marquee.innerHTML = "";

  words.forEach(function (word, wordIndex) {
    const wordSpan = document.createElement("span");

    wordSpan.className = "site-title-word";

    for (let i = 0; i < word.length; i += 1) {
      const span = document.createElement("span");

      span.textContent = word[i];
      span.className = "site-title-letter";
      wordSpan.appendChild(span);
    }

    marquee.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement("span");

      spaceSpan.textContent = "\u00A0";
      spaceSpan.className = "site-title-space site-title-letter";
      marquee.appendChild(spaceSpan);
    }
  });

  marqueeRainbowLinks.push(marquee);
}

function updateMarqueeRainbow() {
  const cycleOffset = Math.floor(Date.now() / marqueeRainbowCycleMs);

  marqueeRainbowLinks.forEach(function (link) {
    const letters = Array.from(link.querySelectorAll(".site-title-letter"));

    letters.forEach(function (letter, index) {
      letter.style.color =
        marqueeRainbowPalette[
          (index + cycleOffset) % marqueeRainbowPalette.length
        ];
    });
  });
}

function startMarqueeRainbow() {
  if (!marqueeRainbowLinks.length || marqueeRainbowTimer) {
    return;
  }

  updateMarqueeRainbow();
  marqueeRainbowTimer = window.setInterval(
    updateMarqueeRainbow,
    marqueeRainbowCycleMs,
  );
}

function getCssRemValue(value, fallback = 0) {
  const numericValue = parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return numericValue;
}

function getCssLengthPixels(value, fallback = 0) {
  const rawValue = String(value || "").trim();
  const rootFontSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  if (rawValue.endsWith("rem")) {
    return getCssRemValue(rawValue, 0) * rootFontSize;
  }

  if (rawValue.endsWith("px")) {
    return getCssRemValue(rawValue, 0);
  }

  return getCssRemValue(rawValue, fallback);
}

function getRootCssLength(variableName, fallback = 0) {
  const style = getComputedStyle(document.documentElement);

  return getCssLengthPixels(style.getPropertyValue(variableName), fallback);
}

function getHeaderParts(header) {
  return {
    headerTop: header.querySelector(".header-top"),
    siteTitle: header.querySelector(".site-title"),
    siteTitleMarquee: header.querySelector(".site-title-marquee"),
  };
}

function setSiteTitleFontSize(siteTitle, fontSize) {
  if (!siteTitle) {
    return;
  }

  if (fontSize) {
    siteTitle.style.fontSize = `${fontSize}px`;
  } else {
    siteTitle.style.removeProperty("font-size");
  }
}

function getSiteTitleTextWidth(siteTitleMarquee) {
  if (!siteTitleMarquee) {
    return 0;
  }

  return Math.max(
    siteTitleMarquee.scrollWidth,
    siteTitleMarquee.getBoundingClientRect().width,
  );
}

function getSiteTitleWidthAtSize(siteTitleMarquee, fontSize) {
  if (!siteTitleMarquee) {
    return 0;
  }

  const probe = siteTitleMarquee.cloneNode(true);
  const titleStyle = getComputedStyle(siteTitleMarquee);

  probe.style.position = "fixed";
  probe.style.left = "-10000px";
  probe.style.top = "0";
  probe.style.width = "max-content";
  probe.style.maxWidth = "none";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.fontFamily = titleStyle.fontFamily;
  probe.style.fontWeight = titleStyle.fontWeight;
  probe.style.fontSize = `${fontSize}px`;
  probe.style.letterSpacing = titleStyle.letterSpacing;
  probe.style.lineHeight = titleStyle.lineHeight;
  probe.style.whiteSpace = "nowrap";

  document.body.appendChild(probe);

  const width = getSiteTitleTextWidth(probe);

  document.body.removeChild(probe);

  return width;
}

function fitSiteTitleToHeader(header) {
  const parts = getHeaderParts(header);

  if (!parts.headerTop || !parts.siteTitle || !parts.siteTitleMarquee) {
    return;
  }

  const maxFontSize = getRootCssLength("--marquee-font-size-max", 96);
  const minFontSize = getRootCssLength("--marquee-font-size-min", 40);
  const headerWidth = parts.headerTop.clientWidth;
  const availableWidth = Math.max(0, headerWidth);
  const maxTitleWidth = getSiteTitleWidthAtSize(
    parts.siteTitleMarquee,
    maxFontSize,
  );

  if (!maxTitleWidth || maxTitleWidth <= availableWidth) {
    setSiteTitleFontSize(parts.siteTitle, maxFontSize);
    return;
  }

  const scaledFontSize = Math.floor(
    maxFontSize * (availableWidth / maxTitleWidth),
  );

  setSiteTitleFontSize(parts.siteTitle, Math.max(minFontSize, scaledFontSize));
}

function updateHeaderCompactState(header) {
  fitSiteTitleToHeader(header);
}

function scheduleHeaderCompactCheck() {
  if (navCompactFrame) {
    window.cancelAnimationFrame(navCompactFrame);
  }

  navCompactFrame = window.requestAnimationFrame(function () {
    navCompactFrame = null;
    renderedHeaders.forEach(updateHeaderCompactState);
  });
}

function renderSiteHeader(header, index) {
  // NOTE: MARQUEE TEXT ACTUAL

  header.innerHTML = `
     <div class="header-top">
     <div class="header-brand">
     <h1 class="site-title">
                         <span class="site-title-marquee" aria-label="Chris Goss">Hello World</span>
                    </h1>
               </div>
          </div>
     `;

  const siteTitleMarquee = header.querySelector(".site-title-marquee");

  if (siteTitleMarquee) {
    siteTitleMarquee.dataset.text = siteTitleMarquee.textContent;
  }

  // Rainbow marquee disabled while the landing page is being restyled.

  renderedHeaders.push(header);
  scheduleHeaderCompactCheck();
}

document.querySelectorAll("[data-site-header]").forEach(renderSiteHeader);
// startMarqueeRainbow();

window.addEventListener("resize", scheduleHeaderCompactCheck);

window.visualViewport?.addEventListener("resize", scheduleHeaderCompactCheck);

if (document.fonts?.ready) {
  document.fonts.ready.then(scheduleHeaderCompactCheck);
}
