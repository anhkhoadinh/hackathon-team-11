// Results Loader Content Script
// This script runs on the web app's /results page and loads data from Chrome Storage

console.log("?? Meeting AI: Results loader script STARTED");
console.log("?? Current URL:", window.location.href);
console.log("?? Document ready state:", document.readyState);

// Load meeting results from Chrome Storage and inject into page
chrome.storage.local.get(["meetingResults"], (data) => {
  console.log("?? Chrome Storage get callback executed");
  console.log("?? Data from Chrome Storage:", data);

  if (data.meetingResults) {
    console.log("? Found meeting results in Chrome Storage");
    console.log("?? Results data:", data.meetingResults);

    // Content scripts CAN access localStorage directly on same origin!
    // No need for inline script injection (which violates CSP)
    try {
      localStorage.setItem(
        "meeting-results",
        JSON.stringify(data.meetingResults)
      );
      console.log("? localStorage saved successfully");

      // Verify it was saved
      const saved = localStorage.getItem("meeting-results");
      console.log(
        "? Verified localStorage:",
        saved ? "Data exists" : "No data"
      );

      // Dispatch custom event to notify the page that data is ready
      window.dispatchEvent(
        new CustomEvent("meetingResultsReady", {
          detail: data.meetingResults,
        })
      );
      console.log("?? Dispatched meetingResultsReady event");

      console.log("? Meeting results loaded successfully!");
    } catch (error) {
      console.error("? Error saving to localStorage:", error);
    }

    // Clear the stored results after loading (optional - uncomment if you want one-time use)
    // chrome.storage.local.remove(['meetingResults']);
  } else {
    console.error("? No meeting results found in Chrome Storage");
    console.log(
      "?? Make sure you clicked 'View Full Results' from the extension"
    );
  }
});
