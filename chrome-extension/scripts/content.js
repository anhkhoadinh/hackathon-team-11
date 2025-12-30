// Content Script - Runs in Google Meet pages
console.log("Meeting AI Assistant: Content script loaded");

// Configuration
const API_BASE_URL = "http://localhost:3000/api"; // Change to your deployed URL

// State management
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let transcriptSegments = [];

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
      <span class="meeting-ai-title">??? Meeting AI</span>
      <button id="meeting-ai-minimize" class="meeting-ai-btn-icon">?</button>
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
    updateStatus("Requesting permissions...", "warning");

    // Request tab audio capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    // Setup MediaRecorder
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    audioChunks = [];
    transcriptSegments = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      await processRecording();
    };

    // Start recording
    mediaRecorder.start();
    isRecording = true;
    recordingStartTime = Date.now();

    // Update UI
    document.getElementById("meeting-ai-start").style.display = "none";
    document.getElementById("meeting-ai-stop").style.display = "block";
    document.getElementById("meeting-ai-transcript").style.display = "block";
    updateStatus("Recording...", "recording");
    startTimer();

    console.log("Recording started");
  } catch (error) {
    console.error("Failed to start recording:", error);
    showError(
      "Failed to start recording. Please make sure you granted permission to record audio."
    );
  }
}

// Stop recording
async function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;

    // Stop all tracks
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());

    // Update UI
    document.getElementById("meeting-ai-start").style.display = "block";
    document.getElementById("meeting-ai-stop").style.display = "none";
    updateStatus("Processing...", "processing");
    stopTimer();

    console.log("Recording stopped");
  }
}

// Process recorded audio
async function processRecording() {
  try {
    updateStatus("Transcribing audio...", "processing");

    // Create blob from chunks
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    // Convert to file
    const audioFile = new File([audioBlob], "meeting-recording.webm", {
      type: "audio/webm",
    });

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
    displaySummary(analysisData);
    updateStatus("Complete!", "success");

    // Notify user
    showNotification(
      "Meeting processed successfully! Open extension to view results."
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
function displaySummary(analysis) {
  const content = document.getElementById("meeting-ai-transcript-content");

  const summaryDiv = document.createElement("div");
  summaryDiv.className = "meeting-ai-summary";
  summaryDiv.innerHTML = `
    <div class="meeting-ai-summary-section">
      <h4>?? Summary</h4>
      <ul>
        ${analysis.summary.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </div>
    <div class="meeting-ai-summary-section">
      <h4>? Action Items (${analysis.actionItems.length})</h4>
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
      <h4>?? Key Decisions</h4>
      <ul>
        ${analysis.keyDecisions
          .map((decision) => `<li>${decision}</li>`)
          .join("")}
      </ul>
    </div>
    `
        : ""
    }
  `;

  content.appendChild(summaryDiv);
  content.scrollTop = content.scrollHeight;
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
