/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: FCC ACT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function createFccBlock(label, value) {
  const block = document.createElement("small");
  const heading = document.createElement("strong");

  heading.textContent = `${label}:`;
  block.append(heading, " ", value);

  return block;
}

function createFccProgress(certificate) {
  const { chapters } = certificate;
  const block = document.createElement("section");
  const segments = document.createElement("div");

  block.className = "fcc-progress";
  segments.className = "progress-segments";

  chapters.forEach((chapter) => {
    const segment = document.createElement("div");
    const progress = document.createElement("progress");
    const count = document.createElement("small");

    segment.className = "progress-chapter";
      if (chapter.completedLessons >= chapter.totalLessons) {
        segment.classList.add("is-complete");
      }
    segment.style.flexGrow = chapter.totalLessons;
    progress.value = chapter.completedLessons;
    progress.max = chapter.totalLessons;
    progress.setAttribute(
      "aria-label",
      `Chapter ${chapter.chapter}: ${chapter.completedLessons} of ${chapter.totalLessons} lessons completed`
    );
    progress.textContent = `${chapter.completedLessons} of ${chapter.totalLessons}`;
    count.textContent = `${chapter.completedLessons}/${chapter.totalLessons}`;
    count.setAttribute("aria-hidden", "true");

    segment.append(progress, count);
    segments.append(segment);
  });

  block.append(segments);
  return block;
}

function createFccGoal(chapters, goalDate) {
  const block = document.createElement("small");
  const heading = document.createElement("strong");
  const statusText = document.createElement("span");
  const goal = new Date(`${goalDate}T00:00:00Z`);
  const localDateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const localDate = Object.fromEntries(
    localDateParts.map((part) => [part.type, part.value])
  );
  const today = new Date(
    `${localDate.year}-${localDate.month}-${localDate.day}T00:00:00Z`
  );
  const totalLessons = chapters.reduce(
    (total, chapter) => total + chapter.totalLessons,
    0
  );
  const completedLessons = chapters.reduce(
    (total, chapter) => total + chapter.completedLessons,
    0
  );
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const remainingLessons = totalLessons - completedLessons;
  const remainingDays = Math.floor((goal - today) / millisecondsPerDay) + 1;
  const lessonsPerDay = remainingLessons / remainingDays;
  const status = completedLessons >= totalLessons
    ? "COMPLETE"
    : remainingDays <= 0 || lessonsPerDay > 3
      ? "BEHIND"
      : lessonsPerDay > 2
        ? "BEHIND"
        : "ON TRACK";
  const formattedGoal = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "2-digit",
    month: "short",
    day: "2-digit",
    weekday: "short"
  }).formatToParts(goal);
  const goalText = formatDateTime(goalDate);

  heading.textContent = "GOAL:";
  statusText.className = `fcc-status fcc-status-${status.toLowerCase().replace(" ", "-")}`;
  statusText.textContent = `(${status})`;
  block.append(
    heading,
    " ",
    goalText,
    " ",
    statusText
  );

  return block;
}

function createCertificateCard(certificate) {
  const section = document.createElement("section");
  section.className = "certificate";
  const heading = document.createElement("a");
  heading.href = certificate.url;
  heading.target = "_blank";
  heading.rel = "noopener noreferrer";
  heading.textContent = certificate.course;

  section.append(
    heading,
    createFccGoal(certificate.chapters, certificate.goalDate),
    createFccBlock(
      "LATEST",
      formatDateTime(certificate.lastActivity)
    ),
    createFccProgress(certificate)
  );

  return section;
}

async function initializeFccActivity() {
  const activity = document.querySelector("#FccActivity");
  const root = document.body.dataset.root;

  try {
    const activityResponse = await fetch(`${root}/learning/activity.json`);

    if (!activityResponse.ok) {
      throw new Error("Certificate activity could not be loaded.");
    }

    const data = await activityResponse.json();

    activity.textContent = "";

    data.certificates.forEach((certificate) => {
      activity.append(createCertificateCard(certificate));
    });

  } catch (error) {
    activity.textContent = "Certificate activity is temporarily unavailable.";
  }
}

initializeFccActivity();

/* !SECTION */
