function initializeTime() {
  const time = document.querySelector("#Time");
  const clockFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  function updateTime() {
    const now = new Date();
    time.textContent = `${formatDateTime(now)}@${clockFormatter.format(now)}`;
    time.dateTime = now.toISOString();
  }

  updateTime();
  window.setInterval(updateTime, 1000);
}

initializeTime();
