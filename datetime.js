function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const isDateOnly =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: isDateOnly ? "UTC" : "America/Los_Angeles",
    year: "2-digit",
    month: "short",
    day: "2-digit",
    weekday: "short"
  }).formatToParts(date);

  const local = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${local.weekday}${local.day}${local.month}${local.year}`;
}