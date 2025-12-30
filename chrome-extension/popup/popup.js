// Popup JavaScript for Meeting AI Assistant

// Get config
const API_BASE_URL =
  typeof CONFIG !== "undefined"
    ? CONFIG.API_BASE_URL
    : "http://localhost:3002/api";

// UI Elements
const statusIcon = document.getElementById("status-icon");
const statusTitle = document.getElementById("status-title");
const statusSubtitle = document.getElementById("status-subtitle");
const startBtn = document.getElementById("start-btn");
const recordingControls = document.getElementById("recording-controls");
const pauseBtn = document.getElementById("pause-btn");
const stopBtn = document.getElementById("stop-btn");
const resumeBtn = document.getElementById("resume-btn");
const timerEl = document.getElementById("timer");
const timerValue = document.getElementById("timer-value");
const openWebAppBtn = document.getElementById("open-webapp-btn");

let timerInterval = null;
let startTime = null;

// Initialize popup
async function init() {
  // Check if we're on a Google Meet page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes("meet.google.com")) {
    statusTitle.textContent = "Ready to Record";
    statusSubtitle.textContent = "Click Start to begin";
    startBtn.disabled = false;
  } else {
    statusTitle.textContent = "Not on Google Meet";
    statusSubtitle.textContent = "Join a meeting first";
    startBtn.disabled = true;
  }

  // Check recording status
  checkRecordingStatus();
}

// Check recording status from storage
async function checkRecordingStatus() {
  const result = await chrome.storage.local.get([
    "isRecording",
    "recordingStartTime",
  ]);

  if (result.isRecording) {
    updateUIState("recording");
    if (result.recordingStartTime) {
      startTime = result.recordingStartTime;
      startTimer();
    }
  } else {
    updateUIState("idle");
  }
}

// Update UI based on state
function updateUIState(state) {
  switch (state) {
    case "idle":
      statusIcon.textContent = "?";
      statusTitle.textContent = "Not Recording";
      statusSubtitle.textContent = "Click Start to begin";
      startBtn.style.display = "block";
      recordingControls.style.display = "none";
      resumeBtn.style.display = "none";
      timerEl.style.display = "none";
      stopTimer();
      break;

    case "recording":
      statusIcon.textContent = "??";
      statusTitle.textContent = "Recording...";
      statusSubtitle.textContent = "Meeting in progress";
      startBtn.style.display = "none";
      recordingControls.style.display = "grid";
      resumeBtn.style.display = "none";
      timerEl.style.display = "flex";
      break;

    case "paused":
      statusIcon.textContent = "??";
      statusTitle.textContent = "Paused";
      statusSubtitle.textContent = "Click Resume to continue";
      startBtn.style.display = "none";
      recordingControls.style.display = "none";
      resumeBtn.style.display = "block";
      timerEl.style.display = "flex";
      stopTimer();
      break;

    case "processing":
      statusIcon.textContent = "?";
      statusTitle.textContent = "Processing...";
      statusSubtitle.textContent = "Analyzing your meeting";
      startBtn.style.display = "none";
      recordingControls.style.display = "none";
      resumeBtn.style.display = "none";
      timerEl.style.display = "none";
      stopTimer();
      break;
  }
}

// Start timer
function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerValue.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }, 1000);
}

// Stop timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerValue.textContent = "00:00";
}

// Button event listeners
startBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes("meet.google.com")) {
    // Send message to content script to start recording
    chrome.tabs.sendMessage(
      tab.id,
      { action: "startRecording" },
      (response) => {
        if (response && response.success) {
          startTime = Date.now();
          chrome.storage.local.set({
            isRecording: true,
            recordingStartTime: startTime,
          });
          updateUIState("recording");
          startTimer();
        }
      }
    );
  }
});

pauseBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes("meet.google.com")) {
    // Send message to content script to pause recording
    chrome.tabs.sendMessage(
      tab.id,
      { action: "pauseRecording" },
      (response) => {
        if (response && response.success) {
          chrome.storage.local.set({ isPaused: true });
          updateUIState("paused");
        }
      }
    );
  }
});

resumeBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes("meet.google.com")) {
    // Send message to content script to resume recording
    chrome.tabs.sendMessage(
      tab.id,
      { action: "resumeRecording" },
      (response) => {
        if (response && response.success) {
          chrome.storage.local.set({ isPaused: false });
          updateUIState("recording");
          startTimer();
        }
      }
    );
  }
});

stopBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes("meet.google.com")) {
    // Send message to content script to stop recording
    chrome.tabs.sendMessage(tab.id, { action: "stopRecording" }, (response) => {
      if (response && response.success) {
        chrome.storage.local.set({
          isRecording: false,
          isPaused: false,
          recordingStartTime: null,
        });
        updateUIState("processing");
      }
    });
  }
});

openWebAppBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: API_BASE_URL.replace("/api", "") });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "recordingStarted") {
    updateUIState("recording");
    startTimer();
  } else if (message.action === "recordingStopped") {
    updateUIState("idle");
    stopTimer();
  } else if (message.action === "processingStarted") {
    updateUIState("processing");
  }
});

// Initialize on load
init();
