function renderLog() {
  chrome.storage.local.get(["copyLog"], (result) => {
    const log = result.copyLog || [];
    const logList = document.getElementById("log");
    logList.innerHTML = "";

    if (log.length === 0) {
      logList.innerHTML =
        '<li class="empty-state">No copied text yet. Copy something to get started!</li>';
      return;
    }

    log
      .slice()
      .reverse()
      .forEach((entry) => {
        const li = document.createElement("li");
        li.className = "log-entry";

        // Get domain from URL for favicon
        const domain = new URL(entry.url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

        // Format timestamp
        const timestamp = new Date(entry.timestamp).toLocaleString();

        // Truncate long text
        const truncatedText =
          entry.text.length > 100
            ? entry.text.substring(0, 100) + "..."
            : entry.text;

        // Truncate long URLs
        const truncatedUrl =
          entry.url.length > 50
            ? entry.url.substring(0, 50) + "..."
            : entry.url;

        li.innerHTML = `
          <div class="entry-header">
            <img src="${faviconUrl}" alt="favicon" class="favicon" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjQ0NDIiByeD0iMiIvPgo8L3N2Zz4K'">
            <span class="domain">${domain}</span>
          </div>
          <div class="entry-content">
            <div class="bullet-point">
              <span class="bullet">•</span>
              <span class="label">Copied Text:</span>
              <span class="value">"${truncatedText}"</span>
            </div>
            <div class="bullet-point">
              <span class="bullet">•</span>
              <span class="label">URL:</span>
              <span class="value">"${truncatedUrl}"</span>
            </div>
            <div class="bullet-point">
              <span class="bullet">•</span>
              <span class="label">Timestamp:</span>
              <span class="value">"${timestamp}"</span>
            </div>
          </div>
        `;

        li.onclick = () => {
          navigator.clipboard.writeText(entry.text);
          // Visual feedback
          li.style.backgroundColor = "#d4edda";
          setTimeout(() => {
            li.style.backgroundColor = "";
          }, 300);
        };

        logList.appendChild(li);
      });
  });
}

document.addEventListener("DOMContentLoaded", renderLog);
