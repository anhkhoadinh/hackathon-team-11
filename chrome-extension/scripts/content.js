// Content Script - Runs in Google Meet pages
console.log("Meeting AI Assistant: Content script loaded");

// Configuration (loaded from config.js)
const API_BASE_URL = CONFIG.API_BASE_URL;

// State management
let isRecording = false;
let recordingStartTime = null;
let transcriptSegments = [];
let injectedScriptReady = false;
let recordingData = null;

// Inject recorder script into page context
function injectRecorderScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/injected-recorder.js");
  script.onload = () => {
    console.log("Injected recorder script loaded");
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Listen for messages from injected script
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const { action, data } = event.data;

  if (action === "INJECTED_READY") {
    console.log("Injected script ready");
    injectedScriptReady = true;
  } else if (action === "RECORDING_STARTED") {
    console.log("Recording started successfully");
    // Notify background for badge
    chrome.runtime.sendMessage({ action: "startRecording" });
  } else if (action === "RECORDING_COMPLETE") {
    console.log("Recording complete, received data");
    recordingData = data;
    // Notify background to clear badge
    chrome.runtime.sendMessage({ action: "stopRecording" });
    processRecording();
  } else if (action === "RECORDING_ERROR") {
    console.error("Recording error from injected script:", data.error);
    showError(data.error);
    updateStatus("Ready to record", "");
    isRecording = false;
    document.getElementById("meeting-ai-start").style.display = "block";
    document.getElementById("meeting-ai-stop").style.display = "none";
    stopTimer();
  }
});

// Inject the script as soon as possible
injectRecorderScript();

// Create floating UI overlay
function createOverlay() {
  // Check if overlay already exists
  if (document.getElementById("meeting-ai-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "meeting-ai-overlay";
  overlay.innerHTML = `
    <div class="meeting-ai-header">
      <span class="meeting-ai-title">Meeting AI</span>
      <button id="meeting-ai-minimize" class="meeting-ai-btn-icon">X</button>
    </div>
    <div class="meeting-ai-content">
      <div class="meeting-ai-status">
        <span id="meeting-ai-status-text">Ready to record</span>
        <span id="meeting-ai-timer">00:00</span>
      </div>
      <div class="meeting-ai-controls">
        <button id="meeting-ai-start" class="meeting-ai-btn meeting-ai-btn-primary">
          Start Recording
        </button>
        <button id="meeting-ai-stop" class="meeting-ai-btn meeting-ai-btn-danger" style="display: none;">
          Stop Recording
        </button>
      </div>
      <div id="meeting-ai-transcript" class="meeting-ai-transcript" style="display: none;">
        <div class="meeting-ai-transcript-header">Live Transcript</div>
        <div id="meeting-ai-transcript-content" class="meeting-ai-transcript-content"></div>
      </div>
      <div id="meeting-ai-error" class="meeting-ai-error" style="display: none;"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Make draggable
  makeDraggable(overlay);

  // Add event listeners
  setupEventListeners();
}

// Make overlay draggable
function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const header = element.querySelector(".meeting-ai-header");

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Setup event listeners
function setupEventListeners() {
  const startBtn = document.getElementById("meeting-ai-start");
  const stopBtn = document.getElementById("meeting-ai-stop");
  const minimizeBtn = document.getElementById("meeting-ai-minimize");

  startBtn?.addEventListener("click", startRecording);
  stopBtn?.addEventListener("click", stopRecording);
  minimizeBtn?.addEventListener("click", toggleMinimize);
}

// Start recording
async function startRecording() {
  try {
    if (!injectedScriptReady) {
      throw new Error("Recorder not ready. Please refresh the page.");
    }

    updateStatus("Requesting permissions...", "warning");

    // Send message to injected script to start recording
    window.postMessage({ action: "START_RECORDING" }, "*");

    // Update state
    isRecording = true;
    recordingStartTime = Date.now();

    // Update UI
    document.getElementById("meeting-ai-start").style.display = "none";
    document.getElementById("meeting-ai-stop").style.display = "block";
    document.getElementById("meeting-ai-transcript").style.display = "block";
    updateStatus("Recording...", "recording");
    startTimer();

    console.log("Recording request sent to injected script");
  } catch (error) {
    console.error("Failed to start recording:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    let errorMessage = "Failed to start recording.";

    if (error.name === "NotAllowedError") {
      errorMessage =
        "? Permission denied. Please allow screen sharing and check 'Share tab audio'.";
    } else if (error.name === "NotSupportedError") {
      errorMessage = "? Screen capture not supported in this browser.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "? No audio/video source found.";
    } else if (error.name === "InvalidStateError") {
      errorMessage = "? Invalid state. Please refresh the page and try again.";
    } else if (error.name === "NotReadableError") {
      errorMessage =
        "? Cannot access media device. Close other apps using audio.";
    } else if (error.message) {
      errorMessage = `? Error: ${error.name} - ${error.message}`;
    }

    showError(errorMessage);
    updateStatus("Ready to record", "");
  }
}

// Stop recording
async function stopRecording() {
  if (isRecording) {
    console.log("Stopping recording...");

    // Send message to injected script to stop recording
    window.postMessage({ action: "STOP_RECORDING" }, "*");

    isRecording = false;

    // Update UI
    document.getElementById("meeting-ai-start").style.display = "block";
    document.getElementById("meeting-ai-stop").style.display = "none";
    updateStatus("Processing...", "processing");
    stopTimer();

    console.log("Stop recording request sent");
  }
}

// Process recorded audio
async function processRecording() {
  try {
    updateStatus("Transcribing audio...", "processing");

    if (!recordingData || !recordingData.audio) {
      throw new Error("No recording data available");
    }

    // Convert base64 back to blob
    const response = await fetch(recordingData.audio);
    const audioBlob = await response.blob();

    const mimeType = recordingData.mimeType || "audio/webm";
    const fileExtension = mimeType.includes("ogg") ? "ogg" : "webm";

    console.log("Audio size:", (audioBlob.size / 1024 / 1024).toFixed(2), "MB");

    // Convert to file
    const audioFile = new File(
      [audioBlob],
      `meeting-recording.${fileExtension}`,
      {
        type: mimeType,
      }
    );

    console.log(
      "Audio file size:",
      (audioFile.size / 1024 / 1024).toFixed(2),
      "MB"
    );

    // Send to transcription API
    const formData = new FormData();
    formData.append("file", audioFile);

    const transcribeResponse = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!transcribeResponse.ok) {
      throw new Error("Transcription failed");
    }

    const transcriptData = await transcribeResponse.json();
    console.log("Transcription complete:", transcriptData);

    // Display transcript
    displayTranscript(transcriptData);

    // Analyze with GPT-4
    updateStatus("Analyzing content...", "processing");

    const analyzeResponse = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript: transcriptData.text,
      }),
    });

    if (!analyzeResponse.ok) {
      throw new Error("Analysis failed");
    }

    const analysisData = await analyzeResponse.json();
    console.log("Analysis complete:", analysisData);

    // Store results
    await chrome.storage.local.set({
      lastMeeting: {
        transcript: transcriptData,
        analysis: analysisData,
        timestamp: new Date().toISOString(),
      },
    });

    // Show summary
    displaySummary(analysisData, transcriptData);
    updateStatus("Complete!", "success");

    // Notify user
    showNotification(
      "Meeting processed successfully! Click 'View Full Results' for details."
    );
  } catch (error) {
    console.error("Processing failed:", error);
    showError(`Processing failed: ${error.message}`);
    updateStatus("Error", "error");
  }
}

// Display transcript
function displayTranscript(transcriptData) {
  const content = document.getElementById("meeting-ai-transcript-content");
  content.innerHTML = "";

  if (transcriptData.segments && transcriptData.segments.length > 0) {
    transcriptData.segments.forEach((segment) => {
      const segmentDiv = document.createElement("div");
      segmentDiv.className = "meeting-ai-segment";
      segmentDiv.innerHTML = `
        <span class="meeting-ai-timestamp">[${formatTime(segment.start)}]</span>
        <span class="meeting-ai-text">${segment.text}</span>
      `;
      content.appendChild(segmentDiv);
    });
  } else {
    content.textContent = transcriptData.text;
  }

  // Scroll to bottom
  content.scrollTop = content.scrollHeight;
}

// Display summary
function displaySummary(analysis, transcript) {
  const content = document.getElementById("meeting-ai-transcript-content");

  const summaryDiv = document.createElement("div");
  summaryDiv.className = "meeting-ai-summary";
  summaryDiv.innerHTML = `
    <div class="meeting-ai-summary-section">
      <h4>Summary</h4>
      <ul>
        ${analysis.summary.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </div>
    <div class="meeting-ai-summary-section">
      <h4>Action Items (${analysis.actionItems.length})</h4>
      <ul>
        ${analysis.actionItems
          .map(
            (item) =>
              `<li>${item.task} - <strong>${item.assignee}</strong></li>`
          )
          .join("")}
      </ul>
    </div>
    ${
      analysis.keyDecisions.length > 0
        ? `
    <div class="meeting-ai-summary-section">
      <h4>Key Decisions</h4>
      <ul>
        ${analysis.keyDecisions
          .map((decision) => `<li>${decision}</li>`)
          .join("")}
      </ul>
    </div>
    `
        : ""
    }
    <div class="meeting-ai-summary-section" style="text-align: center; margin-top: 20px;">
      <button id="meeting-ai-view-full" class="meeting-ai-btn meeting-ai-btn-primary" style="width: 100%;">
        View Full Results & Download PDF
      </button>
    </div>
  `;

  content.appendChild(summaryDiv);
  content.scrollTop = content.scrollHeight;

  // Add click handler for "View Full Results" button
  const viewFullBtn = document.getElementById("meeting-ai-view-full");
  if (viewFullBtn) {
    viewFullBtn.addEventListener("click", () => {
      openFullResults(analysis, transcript);
    });
  }
}

// Open full results in web app
function openFullResults(analysis, transcript) {
  console.log("?? Opening full results in web app...");
  console.log("?? Analysis data:", analysis);
  console.log("?? Transcript data:", transcript);

  // Prepare data in MeetingResult format for web app
  const meetingData = {
    transcript: {
      text: transcript.text || "",
      segments: transcript.segments || [],
      duration: transcript.duration || 0,
    },
    analysis: {
      summary: analysis.summary || [],
      actionItems: analysis.actionItems || [],
      keyDecisions: analysis.keyDecisions || [],
      participants: analysis.participants || [],
    },
    metadata: {
      fileName: "meeting-recording.webm",
      fileSize: 0,
      processedAt: new Date().toISOString(),
      estimatedCost: 0.4,
    },
  };

  console.log("?? Prepared meeting data:", meetingData);

  // Save to Chrome Storage (cross-origin compatible)
  chrome.storage.local.set({ meetingResults: meetingData }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        "? Error saving to Chrome Storage:",
        chrome.runtime.lastError
      );
      return;
    }

    console.log("? Meeting data saved to Chrome Storage successfully!");

    // Verify it was saved
    chrome.storage.local.get(["meetingResults"], (data) => {
      console.log("?? Verification - Chrome Storage contains:", data);
    });

    // Open web app in new tab
    const webAppUrl = CONFIG.API_BASE_URL.replace("/api", "/results");
    console.log("?? Opening URL:", webAppUrl);
    window.open(webAppUrl, "_blank");

    console.log("? Opened web app at:", webAppUrl);
  });
}

// Utility functions
function updateStatus(text, type = "info") {
  const statusText = document.getElementById("meeting-ai-status-text");
  if (statusText) {
    statusText.textContent = text;
    statusText.className = `meeting-ai-status-${type}`;
  }
}

function showError(message) {
  const errorDiv = document.getElementById("meeting-ai-error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }
}

function showNotification(message) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("assets/icon48.png"),
      title: "Meeting AI Assistant",
      message: message,
    });
  }
}

function toggleMinimize() {
  const content = document.querySelector(".meeting-ai-content");
  const btn = document.getElementById("meeting-ai-minimize");

  if (content.style.display === "none") {
    content.style.display = "block";
    btn.textContent = "?";
  } else {
    content.style.display = "none";
    btn.textContent = "+";
  }
}

// Timer functions
let timerInterval = null;

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - recordingStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById("meeting-ai-timer").textContent = `${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

// Initialize when page loads
function init() {
  // Wait for Google Meet to fully load
  const observer = new MutationObserver((mutations, obs) => {
    // Check if we're in a meeting (meeting UI is present)
    const meetingContainer =
      document.querySelector("[data-meeting-title]") ||
      document.querySelector('[jsname="HiaYvf"]');

    if (meetingContainer) {
      console.log("Google Meet detected, creating overlay");
      createOverlay();
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also try to create immediately if already in meeting
  setTimeout(() => {
    if (!document.getElementById("meeting-ai-overlay")) {
      createOverlay();
    }
  }, 3000);
}

// Start initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
