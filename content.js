// Simple version with extensive error checking
(function () {
  "use strict";

  // Check if already injected
  if (window.copyTrackerInjected) {
    return;
  }
  window.copyTrackerInjected = true;

  console.log("CopyTracker content script loading...");

  function sendCopyEvent(text, url, time) {
    // Check if chrome runtime is available
    if (typeof chrome === "undefined") {
      console.warn("Chrome object not available");
      return;
    }

    if (!chrome.runtime) {
      console.warn("Chrome runtime not available");
      return;
    }

    if (!chrome.runtime.sendMessage) {
      console.warn("Chrome runtime.sendMessage not available");
      return;
    }

    try {
      chrome.runtime.sendMessage(
        {
          type: "copy-event",
          text: text,
          url: url,
          time: time,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Message sending failed:", chrome.runtime.lastError);
          } else {
            console.log("Copy event sent successfully");
          }
        }
      );
    } catch (error) {
      console.error("Error sending copy event:", error);
    }
  }

  // Add copy event listener
  document.addEventListener("copy", () => {
    console.log("Copy event detected");

    const selection = document.getSelection()?.toString();
    if (selection && selection.trim()) {
      console.log("Selection found:", selection.substring(0, 50) + "...");
      sendCopyEvent(selection, window.location.href, new Date().toISOString());
    } else {
      console.log("No selection found");
    }
  });

  console.log("CopyTracker content script loaded successfully");
})();
