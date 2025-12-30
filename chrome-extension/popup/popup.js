// Popup Script
console.log("MeetingMind AI Popup loaded");

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
  if (meeting.transcript && meeting.transcript.duration) {
    const mins = Math.floor(meeting.transcript.duration / 60);
    const secs = Math.floor(meeting.transcript.duration % 60);
    document.getElementById("meeting-duration").textContent = `${mins}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  // Update stats - handle both old and new data structures
  const summary = meeting.analysis?.summary || [];
  const actionItems = meeting.analysis?.actionItems || [];
  const keyDecisions = meeting.analysis?.keyDecisions || [];

  // Handle summary as array or object
  const summaryLength = Array.isArray(summary) 
    ? summary.length 
    : (summary.blockersToFollowUp?.length || 0) + (summary.priorityTasks?.length || 0) + (summary.responsibilities?.length || 0);

  document.getElementById("summary-count").textContent = summaryLength || 0;
  document.getElementById("tasks-count").textContent = actionItems.length || 0;
  document.getElementById("decisions-count").textContent = keyDecisions.length || 0;
}

// Show details modal with improved formatting
async function showDetails() {
  try {
    const data = await chrome.storage.local.get("lastMeeting");

    if (!data.lastMeeting) {
      alert("No meeting data available");
      return;
    }

    const meeting = data.lastMeeting;
    const modalBody = document.getElementById("modal-body");

    // Handle both old and new data structures
    const summary = meeting.analysis?.summary || [];
    const actionItems = meeting.analysis?.actionItems || [];
    const keyDecisions = meeting.analysis?.keyDecisions || [];
    const participants = meeting.analysis?.participants || [];
    const transcript = meeting.transcript?.text || "";

    // Format summary
    let summaryHTML = "";
    if (Array.isArray(summary)) {
      summaryHTML = `
        <div class="modal-section">
          <h3>📋 Summary</h3>
          <ul>
            ${summary.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        </div>
      `;
    } else {
      // New structure with blockers, priority tasks, responsibilities
      summaryHTML = `
        <div class="modal-section">
          <h3>📋 Summary</h3>
          ${summary.blockersToFollowUp?.length > 0 ? `
            <div style="margin-bottom: 12px;">
              <strong style="color: #dc2626;">⚠️ Blockers to Follow-up:</strong>
              <ul>
                ${summary.blockersToFollowUp.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
              </ul>
            </div>
          ` : ""}
          ${summary.priorityTasks?.length > 0 ? `
            <div style="margin-bottom: 12px;">
              <strong style="color: #25C9D0;">🎯 Priority Tasks:</strong>
              <ul>
                ${summary.priorityTasks.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
              </ul>
            </div>
          ` : ""}
          ${summary.responsibilities?.length > 0 ? `
            <div>
              <strong style="color: #14B8A6;">👥 Responsibilities:</strong>
              <ul>
                ${summary.responsibilities.map(r => 
                  `<li>${escapeHtml(r.person || r.name || 'Unknown')}: ${escapeHtml(r.task)}${r.deadline ? ` (${escapeHtml(r.deadline)})` : ''}</li>`
                ).join("")}
              </ul>
            </div>
          ` : ""}
        </div>
      `;
    }

    modalBody.innerHTML = `
      ${summaryHTML}

      ${actionItems.length > 0 ? `
      <div class="modal-section">
        <h3>✅ Action Items (${actionItems.length})</h3>
        <ul>
          ${actionItems
            .map(
              (item) =>
                `<li><strong>${escapeHtml(item.task || item)}</strong>${item.assignee ? ` - <span style="color: #25C9D0;">${escapeHtml(item.assignee)}</span>` : ''}${item.dueDate ? ` <span style="color: #64748b; font-size: 11px;">(${escapeHtml(item.dueDate)})</span>` : ''}</li>`
            )
            .join("")}
        </ul>
      </div>
      ` : ""}

      ${keyDecisions.length > 0 ? `
      <div class="modal-section">
        <h3>🎯 Key Decisions</h3>
        <ul>
          ${keyDecisions
            .map((decision) => `<li>${escapeHtml(decision)}</li>`)
            .join("")}
        </ul>
      </div>
      ` : ""}

      ${participants.length > 0 ? `
      <div class="modal-section">
        <h3>👥 Participants</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${participants
            .map(
              (p) =>
                `<span style="display: inline-flex; align-items: center; padding: 6px 12px; background: linear-gradient(135deg, rgba(37, 201, 208, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%); border: 1px solid rgba(37, 201, 208, 0.2); border-radius: 8px; font-size: 12px; font-weight: 600; color: #1f2937;">${escapeHtml(p)}</span>`
            )
            .join("")}
        </div>
      </div>
      ` : ""}

      ${transcript ? `
      <div class="modal-section">
        <h3>📄 Full Transcript</h3>
        <div class="modal-transcript">
          ${escapeHtml(transcript)}
        </div>
      </div>
      ` : ""}
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
  // Try to get API base URL from config, fallback to localhost
  chrome.storage.local.get(["apiBaseUrl"], (data) => {
    const baseUrl = data.apiBaseUrl || "http://localhost:3000";
    chrome.tabs.create({
      url: baseUrl,
    });
  });
}

// Open settings
function openSettings() {
  // Open web app settings page if available
  chrome.storage.local.get(["apiBaseUrl"], (data) => {
    const baseUrl = data.apiBaseUrl || "http://localhost:3000";
    chrome.tabs.create({
      url: `${baseUrl}/settings`,
    });
  });
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Close modal on background click
document.getElementById("details-modal")?.addEventListener("click", (e) => {
  if (e.target.id === "details-modal") {
    closeModal();
  }
});
