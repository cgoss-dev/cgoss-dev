function initializeTime() {
  const time = document.querySelector("#Time");

  function formatTime(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);

    const hours = parts.find((part) => part.type === "hour").value;
    const minutes = parts.find((part) => part.type === "minute").value;

    return `${hours}${minutes}`;
  }

  function updateTime() {
    const now = new Date();
    const seattleTime = formatTime(now, "America/Los_Angeles");
    const zuluTime = formatTime(now, "UTC");

    time.textContent = `${seattleTime} L / ${zuluTime} Z`;
  }

  updateTime();
  window.setInterval(updateTime, 1000);
}

initializeTime();
