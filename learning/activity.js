/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: FCC ACT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function createFccBlock(label, value) {
  const block = document.createElement("p");
  const heading = document.createElement("strong");

  heading.textContent = label;
  block.append(heading, document.createElement("br"), value);

  return block;
}

function createFccProgress(chapters, course) {
  const block = document.createElement("section");
  const heading = document.createElement("a");
  heading.href = "https://www.freecodecamp.org/chrisiscode";
  heading.target = "_blank";
  heading.rel = "noopener noreferrer";
  const summary = document.createElement("span");
  const segments = document.createElement("div");
  const currentChapterIndex = chapters.findIndex(
    (chapter) => chapter.completedLessons < chapter.totalLessons
  );
  const currentChapter = currentChapterIndex === -1
    ? chapters.length
    : currentChapterIndex + 1;
  const currentChapterData = chapters[currentChapter - 1];
  const currentLesson = Math.max(1, currentChapterData.completedLessons);

  block.className = "fcc-progress";
  heading.textContent = course;
  summary.textContent = `Chapter ${currentChapter}, Lesson ${currentLesson}`;
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

  block.append(heading, summary, segments);
  return block;
}

function createFccGoal(chapters, goalDate) {
  const block = document.createElement("p");
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
  const goalParts = Object.fromEntries(
    formattedGoal.map((part) => [part.type, part.value])
  );
  const goalText = `${goalParts.year}${goalParts.month}${goalParts.day}${goalParts.weekday}`.toUpperCase();

  heading.textContent = "GOAL";
  statusText.className = `fcc-status fcc-status-${status.toLowerCase().replace(" ", "-")}`;
  statusText.textContent = `(${status})`;
  block.append(
    heading,
    document.createElement("br"),
    goalText,
    " ",
    statusText
  );

  return block;
}

async function initializeFccActivity() {
  const freeCodeCamp = document.querySelector("#FreeCodeCamp");
  const root = document.body.dataset.root;

  try {
    const [componentResponse, activityResponse] = await Promise.all([
      fetch(`${root}/learning/activity.html`),
      fetch(`${root}/learning/activity.json`)
    ]);

    if (!componentResponse.ok || !activityResponse.ok) {
      throw new Error("The freeCodeCamp activity files could not be loaded.");
    }

    freeCodeCamp.innerHTML = await componentResponse.text();

    const activity = document.querySelector("#FccActivity");
    const data = await activityResponse.json();

    activity.textContent = "";

    data.certificates.forEach((certificate) => {
      activity.append(
        createFccProgress(certificate.chapters, certificate.course),
        createFccGoal(certificate.chapters, certificate.goalDate),
        createFccBlock(
          "LATEST",
          formatDateTime(certificate.lastActivity)
        )
      );
    });

  } catch (error) {
    freeCodeCamp.textContent = "freeCodeCamp activity is temporarily unavailable.";
  }
}

initializeFccActivity();

/* !SECTION */
