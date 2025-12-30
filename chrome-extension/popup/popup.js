// Popup Script
console.log("Popup loaded");

// Load last meeting on popup open
document.addEventListener("DOMContentLoaded", () => {
  loadLastMeeting();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  document
    .getElementById("view-details-btn")
    ?.addEventListener("click", showDetails);
  document
    .getElementById("open-webapp-btn")
    ?.addEventListener("click", openWebApp);
  document
    .getElementById("settings-btn")
    ?.addEventListener("click", openSettings);
  document
    .getElementById("close-modal-btn")
    ?.addEventListener("click", closeModal);
}

// Load last meeting from storage
async function loadLastMeeting() {
  try {
    const data = await chrome.storage.local.get("lastMeeting");

    if (data.lastMeeting) {
      const meeting = data.lastMeeting;
      displayLastMeeting(meeting);
    } else {
      console.log("No meeting data found");
    }
  } catch (error) {
    console.error("Failed to load meeting:", error);
  }
}

// Display last meeting
function displayLastMeeting(meeting) {
  const section = document.getElementById("last-meeting-section");
  section.style.display = "block";

  // Update date
  const date = new Date(meeting.timestamp);
  document.getElementById("meeting-date").textContent = formatDate(date);

  // Update duration
  if (meeting.transcript.duration) {
    const mins = Math.floor(meeting.transcript.duration / 60);
    const secs = Math.floor(meeting.transcript.duration % 60);
    document.getElementById("meeting-duration").textContent = `${mins}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  // Update stats
  document.getElementById("summary-count").textContent =
    meeting.analysis.summary.length;
  document.getElementById("tasks-count").textContent =
    meeting.analysis.actionItems.length;
  document.getElementById("decisions-count").textContent =
    meeting.analysis.keyDecisions.length;
}

// Show details modal
async function showDetails() {
  try {
    const data = await chrome.storage.local.get("lastMeeting");

    if (!data.lastMeeting) {
      alert("No meeting data available");
      return;
    }

    const meeting = data.lastMeeting;
    const modalBody = document.getElementById("modal-body");

    modalBody.innerHTML = `
      <div class="modal-section">
        <h3>?? Summary</h3>
        <ul>
          ${meeting.analysis.summary
            .map((point) => `<li>${point}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="modal-section">
        <h3>? Action Items (${meeting.analysis.actionItems.length})</h3>
        <ul>
          ${meeting.analysis.actionItems
            .map(
              (item) =>
                `<li>${item.task} - <strong>${item.assignee}</strong></li>`
            )
            .join("")}
        </ul>
      </div>

      ${
        meeting.analysis.keyDecisions.length > 0
          ? `
      <div class="modal-section">
        <h3>?? Key Decisions</h3>
        <ul>
          ${meeting.analysis.keyDecisions
            .map((decision) => `<li>${decision}</li>`)
            .join("")}
        </ul>
      </div>
      `
          : ""
      }

      ${
        meeting.analysis.participants.length > 0
          ? `
      <div class="modal-section">
        <h3>?? Participants</h3>
        <p style="font-size: 13px; color: #4b5563;">${meeting.analysis.participants.join(
          ", "
        )}</p>
      </div>
      `
          : ""
      }

      <div class="modal-section">
        <h3>?? Full Transcript</h3>
        <div class="modal-transcript">
          ${meeting.transcript.text}
        </div>
      </div>
    `;

    document.getElementById("details-modal").style.display = "flex";
  } catch (error) {
    console.error("Failed to show details:", error);
    alert("Failed to load meeting details");
  }
}

// Close modal
function closeModal() {
  document.getElementById("details-modal").style.display = "none";
}

// Open web app
function openWebApp() {
  chrome.tabs.create({
    url: "http://localhost:3000", // Change to your deployed URL
  });
}

// Open settings
function openSettings() {
  alert("Settings coming soon!");
  // TODO: Create settings page
}

// Format date
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Close modal on background click
document.getElementById("details-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "details-modal") {
    closeModal();
  }
});
