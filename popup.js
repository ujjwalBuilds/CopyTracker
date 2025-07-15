function renderLog() {
  chrome.storage.local.get(["copyLog"], (result) => {
    const log = result.copyLog || [];
    const logList = document.getElementById("log");
    logList.innerHTML = "";
    log
      .slice()
      .reverse()
      .forEach((entry) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${entry.text}</strong><br/><small>${
          entry.url
        } — ${new Date(entry.timestamp).toLocaleString()}</small>`;
        li.onclick = () => navigator.clipboard.writeText(entry.text);
        logList.appendChild(li);
      });
  });
}

document.addEventListener("DOMContentLoaded", renderLog);