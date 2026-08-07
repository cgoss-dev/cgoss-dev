/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: GIT ACT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function formatPushTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${time}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${time}`;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function createActivityBlock(label, lines) {
  const block = document.createElement("p");
  const heading = document.createElement("strong");
  heading.textContent = label;
  block.append(heading);

  lines.forEach((line) => {
    block.append(document.createElement("br"), line);
  });

  return block;
}

function pluralize(number, singular, plural = `${singular}s`) {
  return `${number} ${number === 1 ? singular : plural}`;
}

async function initializeGithubActivity() {
  const github = document.querySelector("#Github");

  try {
    const [componentResponse, activityResponse] = await Promise.all([
      fetch("github/activity.html"),
      fetch("github/activity.json")
    ]);

    if (!componentResponse.ok || !activityResponse.ok) {
      throw new Error("The GitHub activity files could not be loaded.");
    }

    github.innerHTML = await componentResponse.text();

    const activity = document.querySelector("#Activity");
    const data = await activityResponse.json();
    const pushTime = formatPushTime(data.lastPush);

    activity.textContent = "";
    const latestLines = pushTime
      ? [pushTime]
      : ["No recent public pushes"];

    const thirtyDayActivity = [
      `${pluralize(data.commitsThirtyDays, "commit")} / ${pluralize(
        data.repositoriesThirtyDays,
        "repository",
        "repositories"
      )}`
    ];

    activity.append(
      createActivityBlock("LATEST", latestLines),
      createActivityBlock("30 DAYS", thirtyDayActivity)
    );

    const profile = document.createElement("a");
    profile.href = "https://github.com/cgoss-dev";
    profile.target = "_blank";
    profile.rel = "noopener noreferrer";
    profile.textContent = "View GitHub →";
    activity.append(profile);
  } catch (error) {
    github.textContent = "GitHub activity is temporarily unavailable.";
  }
}

initializeGithubActivity();

/* !SECTION */
