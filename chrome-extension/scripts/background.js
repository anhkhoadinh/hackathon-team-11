// Background Service Worker
console.log("Meeting AI Assistant: Background service worker loaded");

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Meeting AI Assistant installed");

    // Set default settings
    chrome.storage.local.set({
      settings: {
        autoStart: false,
        apiUrl: "http://localhost:3000/api",
        notifications: true,
      },
    });

    // Open welcome page (commented out - file doesn't exist yet)
    // chrome.tabs.create({
    //   url: "popup/welcome.html",
    // });
  } else if (details.reason === "update") {
    console.log("Meeting AI Assistant updated");
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  if (request.action === "startRecording") {
    // Update badge
    chrome.action.setBadgeText({ text: "REC", tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({
      color: "#ef4444",
      tabId: sender.tab.id,
    });
    sendResponse({ success: true });
  } else if (request.action === "stopRecording") {
    // Clear badge
    chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
    sendResponse({ success: true });
  } else if (request.action === "getSettings") {
    chrome.storage.local.get("settings", (data) => {
      sendResponse({ settings: data.settings || {} });
    });
    return true; // Keep channel open for async response
  } else if (request.action === "saveSettings") {
    chrome.storage.local.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  return false;
});

// Listen for tab updates (navigate away from Meet)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Check if user left Google Meet
    if (!tab.url.includes("meet.google.com")) {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Open extension popup or results page
  chrome.action.openPopup();
});
