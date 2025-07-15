chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "copy-event") {
    chrome.storage.local.get(["copyLog"], (result) => {
      const copyLog = result.copyLog || [];
      copyLog.push({
        text: message.text,
        url: message.url,
        timestamp: message.time,
      });
      chrome.storage.local.set({ copyLog: copyLog.slice(-100) });
    });
  }
});
console.log("Service Worker running...");
