/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: GIT ACT */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function pluralize(number, singular, plural = `${singular}s`) {
  return `${number} ${number === 1 ? singular : plural}`;
}

function createHeatmap(weeks, latestActivityDate) {
  const section = document.createElement("section");
  const heading = document.createElement("h3");

  const heatmap = document.createElement("a");
  heatmap.href = "https://github.com/cgoss-dev";
  heatmap.target = "_blank";
  heatmap.rel = "noopener noreferrer";

  const icon = document.createElement("i");
  icon.className = "fa-brands fa-github";
  icon.setAttribute("aria-hidden", "true");
  const headingLink = document.createElement("a");
  headingLink.href = heatmap.href;
  headingLink.target = "_blank";
  headingLink.rel = "noopener noreferrer";
  headingLink.append(icon, " Latest Activity ", latestActivityDate || "No recent public pushes");
  heading.append(headingLink);
  heatmap.className = "heatmap";
  heatmap.setAttribute(
    "aria-label",
    "View my GitHub profile: contributions during the last 12 weeks (opens in a new tab)"
  );

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
    if (data.contributionWeeks?.length) {
      activity.append(createHeatmap(data.contributionWeeks, pushTime));
    }

  } catch (error) {
    github.textContent = "GitHub activity is temporarily unavailable.";
  }
}

initializeGithubActivity();

/* !SECTION */
