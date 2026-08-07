/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: SETTINGS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

import { writeFile } from "node:fs/promises";

const username = "cgoss-dev";
const outputPath = "github/activity.json";
const eventsPerPage = 100;
const maximumPages = 3;
const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: EVENTS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function getHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "cgoss-dev activity updater",
    "X-GitHub-Api-Version": "2026-03-10"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchEvents() {
  const events = [];
  const cutoff = Date.now() - thirtyDaysInMilliseconds;

  for (let page = 1; page <= maximumPages; page++) {
    const url = new URL(`https://api.github.com/users/${username}/events/public`);
    url.searchParams.set("per_page", eventsPerPage);
    url.searchParams.set("page", page);

    const response = await fetch(url, { headers: getHeaders() });

    if (!response.ok) {
      throw new Error(
        `GitHub activity request failed: ${response.status} ${response.statusText}`
      );
    }

    const pageEvents = await response.json();
    events.push(...pageEvents);

    if (pageEvents.length < eventsPerPage) {
      break;
    }

    const oldestEvent = pageEvents.at(-1);

    if (new Date(oldestEvent.created_at).getTime() < cutoff) {
      break;
    }
  }

  return events;
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: SUMMARY */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

async function getCommitCount(cutoff) {
  const cutoffDate = new Date(cutoff).toISOString().slice(0, 10);
  const url = new URL("https://api.github.com/search/commits");
  url.searchParams.set(
    "q",
    `author:${username} author-date:>=${cutoffDate}`
  );
  url.searchParams.set("per_page", 1);

  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error(
      `GitHub commit search failed: ${response.status} ${response.statusText}`
    );
  }

  const results = await response.json();
  return results.total_count || 0;
}

async function summarizeActivity(events) {
  const cutoff = Date.now() - thirtyDaysInMilliseconds;
  const pushEvents = events.filter((event) => event.type === "PushEvent");
  const latestPush = pushEvents[0];
  const recentPushes = pushEvents.filter(
    (event) => new Date(event.created_at).getTime() >= cutoff
  );

  const repositories = new Set(
    recentPushes.map((event) => event.repo.name)
  );

  // Search once for public commits authored by this account during the same period.
  const commitsThirtyDays = await getCommitCount(cutoff);

  return {
    lastPush: latestPush?.created_at || null,
    lastRepository: latestPush?.repo.name || null,
    repositoriesThirtyDays: repositories.size,
    commitsThirtyDays
  };
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: UPDATE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

async function updateGithubActivity() {
  const events = await fetchEvents();
  const activity = await summarizeActivity(events);

  await writeFile(outputPath, `${JSON.stringify(activity, null, 2)}\n`);
}

updateGithubActivity().catch((error) => {
  console.error(error);
  process.exit(1);
});

/* !SECTION */
