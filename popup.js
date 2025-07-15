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
      .forEach((entry, index) => {
        const originalIndex = log.length - 1 - index; // Get original index for deletion
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
            <div class="entry-actions">
              <button class="menu-btn" onclick="toggleMenu(event, ${originalIndex})">
                <span class="dots">⋮</span>
              </button>
              <div class="dropdown-menu" id="menu-${originalIndex}">
                <button onclick="deleteEntry(${originalIndex})">🗑️ Delete</button>
              </div>
            </div>
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
              <span class="value clickable-url" onclick="openUrl('${entry.url}', event)" title="Click to open: ${entry.url}">"${truncatedUrl}"</span>
            </div>
            <div class="bullet-point">
              <span class="bullet">•</span>
              <span class="label">Timestamp:</span>
              <span class="value">"${timestamp}"</span>
            </div>
          </div>
        `;

        li.onclick = (e) => {
          // Don't copy when clicking on actions or URL
          if (
            e.target.closest(".entry-actions") ||
            e.target.closest(".clickable-url")
          ) {
            return;
          }

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

function toggleMenu(event, index) {
  event.stopPropagation();
  const menu = document.getElementById(`menu-${index}`);
  const allMenus = document.querySelectorAll(".dropdown-menu");

  // Close all other menus
  allMenus.forEach((m) => {
    if (m !== menu) {
      m.classList.remove("show");
    }
  });

  // Toggle current menu
  menu.classList.toggle("show");
}

function deleteEntry(index) {
  chrome.storage.local.get(["copyLog"], (result) => {
    const log = result.copyLog || [];
    log.splice(index, 1);
    chrome.storage.local.set({ copyLog: log }, () => {
      renderLog();
    });
  });
}

function clearAllEntries() {
  if (confirm("Are you sure you want to clear all copied entries?")) {
    chrome.storage.local.set({ copyLog: [] }, () => {
      renderLog();
    });
  }
}

function openUrl(url, event) {
  event.stopPropagation();
  chrome.tabs.create({ url: url });
}

// Close dropdowns when clicking outside
document.addEventListener("click", () => {
  const allMenus = document.querySelectorAll(".dropdown-menu");
  allMenus.forEach((menu) => {
    menu.classList.remove("show");
  });
});

document.addEventListener("DOMContentLoaded", renderLog);
