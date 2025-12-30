# Chrome Extension Features

## ?? Real-time Meeting Recording

Record audio directly from Google Meet tabs with one click.

### How it works

1. Click **"Start Recording"** in the overlay
2. Allow tab audio sharing
3. Recording starts automatically
4. Click **"Stop Recording"** when done

---

## ?? Live Transcript

See real-time transcription as the meeting progresses.

- **Timestamps:** Each segment includes time markers
- **Live Updates:** Transcript appears during recording
- **Accurate:** Powered by OpenAI Whisper

---

## ?? AI Analysis

Automatic analysis after recording completes.

### Extracted Information

- **Summary:** 5-7 key points discussed
- **Action Items:** Tasks with assignees
- **Key Decisions:** Important decisions made
- **Participants:** People mentioned in the meeting

---

## ?? View Full Results

**NEW FEATURE:** View complete results in web app with one click!

### Flow

```
Extension Overlay (Quick Preview)
         ?
   [View Full Results]
         ?
  Web App (Full Details)
         ?
   Download PDF
```

### Benefits

? **Quick Preview** in extension for instant insights  
? **Full Details** in web app for comprehensive view  
? **Download PDF** to share with team  
? **Professional Format** for documentation  

### How to Use

1. Complete a recording
2. Wait for analysis to finish
3. Click **"View Full Results & Download PDF"**
4. New tab opens with full results
5. Click **"Download PDF"** to save

---

## ?? Data Management

### Storage

- **Chrome Storage:** Last meeting saved locally
- **localStorage:** Transfer data to web app
- **No Server Storage:** Privacy-focused design

### Privacy

- ? Audio processed via API only
- ? No permanent server storage
- ? Results stored locally in browser
- ? User controls all data

---

## ?? UI Features

### In-Meeting Overlay

- **Draggable:** Move anywhere on screen
- **Minimizable:** Collapse to save space
- **Status Updates:** Real-time progress
- **Timer:** Recording duration display

### Result Display

- **Tabbed Interface:** Easy navigation
- **Color-coded:** Visual distinction
- **Responsive:** Works on all screen sizes
- **Professional:** Clean, modern design

---

## ?? Configuration

See `CONFIG.md` for setup instructions.

**Key Config:**

- `API_BASE_URL`: Your web app URL
- Update via `config.js` file
- No extension rebuild needed

---

## ?? Performance

- **Fast Processing:** ~3-5 seconds for transcription
- **Efficient:** Minimal memory usage
- **Reliable:** Error handling & retry logic
- **Scalable:** Works with meetings of any length

---

## ?? Compatibility

- ? **Chrome:** Version 88+
- ? **Google Meet:** All versions
- ? **Audio Formats:** WebM, Opus
- ? **File Size:** Up to 25MB recordings

---

## ?? Updates

Extension automatically uses latest API features. No manual updates needed for API changes.

For extension updates:

1. Download new version
2. Go to `chrome://extensions/`
3. Click **"Update"**
4. Refresh Google Meet tabs

---

## ?? Support

Issues? Check:

1. Extension is enabled
2. Microphone/tab audio permission granted
3. Web app is running (localhost:3002)
4. API key is configured in `.env.local`

See `INSTALLATION.md` and `USAGE_GUIDE.md` for detailed help.
