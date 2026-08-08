/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: GIT ACT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

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

function createHeatmap(weeks) {
  const section = document.createElement("section");
  const heading = document.createElement("strong");
  const heatmap = document.createElement("div");

  heading.textContent = "12 WEEKS";
  heatmap.className = "heatmap";
  heatmap.setAttribute("role", "group");
  heatmap.setAttribute("aria-label", "GitHub contributions during the last 12 weeks");

  weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day) => {
      const square = document.createElement("span");
      const contributionLabel = pluralize(day.contributionCount, "contribution");

      square.className = "heatmap-day";
      square.dataset.level = day.contributionLevel;
      square.style.gridColumn = weekIndex + 1;
      square.style.gridRow = day.weekday + 1;
      square.setAttribute("role", "img");
      square.setAttribute("aria-label", `${day.date}: ${contributionLabel}`);
      square.title = `${day.date}: ${contributionLabel}`;
      heatmap.append(square);
    });
  });

  section.append(heading, heatmap);
  return section;
}

async function initializeGithubActivity() {
  const github = document.querySelector("#Github");
  const root = document.body.dataset.root;

  try {
    const [componentResponse, activityResponse] = await Promise.all([
      fetch(`${root}/projects/activity.html`),
      fetch(`${root}/projects/activity.json`)
    ]);

    if (!componentResponse.ok || !activityResponse.ok) {
      throw new Error("The GitHub activity files could not be loaded.");
    }

    github.innerHTML = await componentResponse.text();

    const activity = document.querySelector("#Activity");
    const data = await activityResponse.json();
    const pushTime = formatDateTime(data.lastPush);

    activity.textContent = "";
    const latestLines = pushTime
      ? [pushTime]
      : ["No recent public pushes"];

    activity.append(createActivityBlock("LATEST", latestLines));

    if (data.contributionWeeks?.length) {
      activity.append(createHeatmap(data.contributionWeeks));
    }

    const profile = document.createElement("a");
    profile.href = "https://github.com/cgoss-dev";
    profile.target = "_blank";
    profile.rel = "noopener noreferrer";
    profile.textContent = "View GitHub →";

    const action = document.createElement("p");
    action.className = "card-action";
    action.append(profile);
    activity.append(action);
  } catch (error) {
    github.textContent = "GitHub activity is temporarily unavailable.";
  }
}

initializeGithubActivity();

/* !SECTION */
