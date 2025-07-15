// Enhanced background script with multiple injection strategies
console.log("CopyTracker: Background script starting...");

// Store injected tabs to avoid duplicate injections
const injectedTabs = new Set();

// Function to inject content script
async function injectContentScript(tabId, url) {
  if (injectedTabs.has(tabId)) {
    return;
  }

  // Skip chrome:// and extension pages
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("moz-extension://")
  ) {
    return;
  }

  try {
    console.log(`CopyTracker: Injecting into tab ${tabId} - ${url}`);

    // Try injecting the content script file first
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });

    injectedTabs.add(tabId);
    console.log(`CopyTracker: Successfully injected into tab ${tabId}`);
  } catch (error) {
    console.log(
      `CopyTracker: File injection failed for tab ${tabId}:`,
      error.message
    );

    // Fallback: inject inline script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: inlineContentScript,
        world: "ISOLATED",
      });

      injectedTabs.add(tabId);
      console.log(
        `CopyTracker: Fallback injection successful for tab ${tabId}`
      );
    } catch (fallbackError) {
      console.log(
        `CopyTracker: All injection methods failed for tab ${tabId}:`,
        fallbackError.message
      );
    }
  }
}

// Inline content script function (fallback)
function inlineContentScript() {
  if (window.copyTrackerInjected) {
    return;
  }
  window.copyTrackerInjected = true;

  console.log("CopyTracker: Inline script active");

  document.addEventListener("copy", () => {
    const selection = document.getSelection()?.toString();
    if (selection && selection.trim()) {
      try {
        chrome.runtime.sendMessage({
          type: "copy-event",
          text: selection,
          url: window.location.href,
          time: new Date().toISOString(),
        });
      } catch (error) {
        console.error("CopyTracker: Message send failed:", error);
      }
    }
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    await injectContentScript(tabId, tab.url);
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      await injectContentScript(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    console.log("CopyTracker: Error handling tab activation:", error.message);
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log("CopyTracker: Extension installed/updated");

  // Inject into all existing tabs
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && tab.id) {
        await injectContentScript(tab.id, tab.url);
      }
    }
  } catch (error) {
    console.log(
      "CopyTracker: Error injecting into existing tabs:",
      error.message
    );
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "copy-event") {
    console.log("CopyTracker: Received copy event:", message);

    try {
      chrome.storage.local.get(["copyLog"], (result) => {
        const copyLog = result.copyLog || [];
        copyLog.push({
          text: message.text,
          url: message.url,
          timestamp: message.time,
        });

        chrome.storage.local.set({ copyLog: copyLog.slice(-100) }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "CopyTracker: Storage error:",
              chrome.runtime.lastError
            );
          } else {
            console.log("CopyTracker: Copy event stored successfully");
          }
        });
      });
    } catch (error) {
      console.error("CopyTracker: Error storing copy event:", error);
    }
  }
});

console.log("CopyTracker: Background script ready");
