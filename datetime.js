function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  function getParts(timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      year: "2-digit",
      month: "short",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);

    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  }

  const local = getParts("America/Los_Angeles");
  const zulu = getParts("UTC");
  const localDate = `${local.year}${local.month}${local.day}${local.weekday}`.toUpperCase();

  return `${localDate} @ ${local.hour}:${local.minute}L/${zulu.hour}:${zulu.minute}Z`;
}
