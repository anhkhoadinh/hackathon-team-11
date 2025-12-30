// Injected Recorder - Runs in page context (not content script)
// This allows us to use getDisplayMedia() which requires page context

(function () {
  console.log("Injected recorder loaded");

  let mediaRecorder = null;
  let audioChunks = [];
  let stream = null;

  // Listen for messages from content script
  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;

    const { action, data } = event.data;

    if (action === "START_RECORDING") {
      try {
        console.log("Starting recording via injected script...");

        // Request display media with audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "browser",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
          preferCurrentTab: true,
        });

        // Check if audio track exists
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          throw new Error(
            'No audio track found. Please make sure to check "Share tab audio" when sharing.'
          );
        }

        console.log("Stream obtained, audio tracks:", audioTracks.length);

        // We only want audio, stop video track
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });

        // Setup MediaRecorder
        let mimeType = "audio/webm;codecs=opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/webm";
        }

        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          console.log("Recording stopped, creating blob...");
          const audioBlob = new Blob(audioChunks, { type: mimeType });

          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            window.postMessage(
              {
                action: "RECORDING_COMPLETE",
                data: {
                  audio: reader.result,
                  mimeType: mimeType,
                  size: audioBlob.size,
                },
              },
              "*"
            );
          };
          reader.readAsDataURL(audioBlob);

          // Cleanup
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            stream = null;
          }
        };

        mediaRecorder.start();
        console.log("Recording started successfully");

        window.postMessage(
          {
            action: "RECORDING_STARTED",
            data: { success: true },
          },
          "*"
        );
      } catch (error) {
        console.error("Recording error:", error);
        window.postMessage(
          {
            action: "RECORDING_ERROR",
            data: { error: error.message },
          },
          "*"
        );
      }
    } else if (action === "STOP_RECORDING") {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        console.log("Stopping recording...");
        mediaRecorder.stop();
      }
    }
  });

  // Notify content script that injected script is ready
  window.postMessage({ action: "INJECTED_READY" }, "*");
})();
