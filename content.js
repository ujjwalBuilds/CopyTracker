// Robust content script that handles different contexts
(function () {
  "use strict";

  // Prevent multiple injections
  if (window.copyTrackerInjected) {
    return;
  }
  window.copyTrackerInjected = true;

  console.log("CopyTracker: Initializing...");

  function isChromeExtensionAvailable() {
    return (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.sendMessage &&
      chrome.runtime.id
    );
  }

  function sendMessageToBackground(data) {
    if (!isChromeExtensionAvailable()) {
      console.warn("CopyTracker: Chrome extension APIs not available");
      return;
    }

    try {
      chrome.runtime.sendMessage(data, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "CopyTracker: Message failed:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("CopyTracker: Message sent successfully");
        }
      });
    } catch (error) {
      console.error("CopyTracker: Error sending message:", error);
    }
  }

  function handleCopyEvent() {
    console.log("CopyTracker: Copy event detected");

    const selection = document.getSelection()?.toString();
    if (!selection || !selection.trim()) {
      console.log("CopyTracker: No text selected");
      return;
    }

    const copyData = {
      type: "copy-event",
      text: selection,
      url: window.location.href,
      time: new Date().toISOString(),
    };

    console.log("CopyTracker: Sending copy data:", copyData);
    sendMessageToBackground(copyData);
  }

  // Add event listener
  document.addEventListener("copy", handleCopyEvent);

  // Test if extension is working
  if (isChromeExtensionAvailable()) {
    console.log("CopyTracker: Successfully initialized with Chrome APIs");
  } else {
    console.warn(
      "CopyTracker: Chrome APIs not available - extension may not work"
    );
  }
})();
