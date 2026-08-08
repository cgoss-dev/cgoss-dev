function initializeTime() {
  const time = document.querySelector("#Time");

  function updateTime() {
    time.textContent = formatDateTime(new Date());
  }

  updateTime();
  window.setInterval(updateTime, 1000);
}

initializeTime();
