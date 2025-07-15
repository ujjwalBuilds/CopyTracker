chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "copy-event") {
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
            console.error("Storage error:", chrome.runtime.lastError);
          }
        });
      });
    } catch (error) {
      console.error("Error in background script:", error);
    }
  }
});

console.log("Service Worker running...");
