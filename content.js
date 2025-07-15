document.addEventListener("copy", () => {
  const selection = document.getSelection()?.toString();
  if (selection) {
    chrome.runtime.sendMessage({
      type: "copy-event",
      text: selection,
      url: window.location.href,
      time: new Date().toISOString(),
    });
  }
});
