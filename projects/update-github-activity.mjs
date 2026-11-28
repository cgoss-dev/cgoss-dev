/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: SETTINGS */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

import { writeFile } from "node:fs/promises";

const username = "cgoss-dev";
const outputPath = "projects/activity.json";
const eventsPerPage = 100;
const maximumPages = 3;
const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;
const heatmapWeeks = 12;

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

async function fetchContributionWeeks() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
        query ContributionCalendar($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    contributionCount
                    contributionLevel
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
      `,
      variables: { username }
    })
  });

  if (!response.ok) {
    throw new Error(
      `GitHub contribution request failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  if (result.errors || !result.data?.user) {
    throw new Error("GitHub contribution data could not be loaded.");
  }

  const weeks =
    result.data.user.contributionsCollection.contributionCalendar.weeks;

  return weeks.slice(-heatmapWeeks);
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: SUMMARY */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

function summarizeActivity(events) {
  const latestPush = events.find((event) => event.type === "PushEvent");
  return { lastPush: latestPush?.created_at || null };
}

/* !SECTION */



/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */
/* SECTION: UPDATE */
/* ========== ========== ========== ========== ========== ========== ========== ========== ========== */

async function updateGithubActivity() {
  const [events, contributionWeeks] = await Promise.all([
    fetchEvents(),
    fetchContributionWeeks()
  ]);
  const activity = {
    ...summarizeActivity(events),
    contributionWeeks
  };

  await writeFile(outputPath, `${JSON.stringify(activity, null, 2)}\n`);
}

updateGithubActivity().catch((error) => {
  console.error(error);
  process.exit(1);
});

/* !SECTION */
