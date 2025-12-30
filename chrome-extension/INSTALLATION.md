# Quick Installation Guide - Chrome Extension

## Prerequisites ?

- ? Chrome Browser (version 88+)
- ? Meeting AI Web App running (<http://localhost:3000>)
- ? 10 minutes

## Step-by-Step Installation

### 1. Prepare Web App (5 minutes)

```bash
# Terminal 1: Start the web app
cd meeting-ai
npm run dev
```

Keep this running! Extension needs web app API.

Verify: Open <http://localhost:3000> - should see upload page

### 2. Create Extension Icons (2 minutes)

Extension needs 3 icon files. **Quick solution**:

```bash
cd chrome-extension/assets

# Option A: Use any PNG image as placeholder
# Copy any icon.png 3 times:
cp ~/Downloads/any-icon.png icon16.png
cp ~/Downloads/any-icon.png icon48.png
cp ~/Downloads/any-icon.png icon128.png

# Option B: Download free icons
# Visit: https://www.flaticon.com/free-icon/microphone
# Download PNG và rename thành icon16.png, icon48.png, icon128.png
```

Or create simple colored squares:

- 16x16px red square ? icon16.png
- 48x48px red square ? icon48.png  
- 128x128px red square ? icon128.png

### 3. Load Extension into Chrome (2 minutes)

1. Open Chrome
2. Navigate to: **chrome://extensions/**
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the `chrome-extension` folder
6. Done! Extension icon appears in toolbar

### 4. Verify Installation (1 minute)

Check if extension loaded correctly:

**In chrome://extensions/ page:**

- ? Extension tile shows "Meeting AI Assistant"
- ? Version 1.0.0
- ? Status: Enabled (toggle is on)
- ? No errors shown

**Click extension icon in toolbar:**

- ? Popup opens
- ? Shows "Ready to Record" status

## First Test ??

### Test the Extension

1. **Join Google Meet**

   ```
   Visit: https://meet.google.com/
   Create or join a meeting
   ```

2. **Check Overlay**
   - Purple overlay appears in top-right corner
   - Shows "??? Meeting AI" title
   - Has "Start Recording" button

3. **Test Recording (Optional)**
   - Click "Start Recording"
   - Allow audio capture when prompted
   - Select Google Meet tab
   - Should show "Recording..." status
   - Speak for 10 seconds
   - Click "Stop Recording"
   - Wait for processing (~30 seconds)
   - Notification appears when done

4. **Check Results**
   - Click extension icon
   - Should show last meeting stats
   - Click "View Details" to see full results

## Configuration ??

### If Web App is on Different Port

If your web app runs on different port (not 3000):

1. Open `chrome-extension/scripts/content.js`
2. Find line 4:

   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

3. Change port:

   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

4. Reload extension:
   - Go to chrome://extensions/
   - Click reload icon (??) on the extension

### If Deployed to Production

1. Deploy web app to Vercel (see DEPLOYMENT.md)
2. Get production URL (e.g., <https://meeting-ai.vercel.app>)
3. Update `scripts/content.js`:

   ```javascript
   const API_BASE_URL = 'https://meeting-ai.vercel.app/api';
   ```

4. Reload extension

## Troubleshooting ??

### Extension not appearing

```bash
# Check folder structure
cd chrome-extension
ls -la

# Should see:
# - manifest.json
# - scripts/
# - styles/
# - popup/
# - assets/
```

Fix: Make sure you selected the correct folder containing `manifest.json`

### "Manifest file is missing or unreadable"

Fix: Check `manifest.json` file exists and is valid JSON

```bash
# Validate JSON
cat manifest.json | python -m json.tool
```

### "Could not load icon"

Fix: Add placeholder icons to `assets/` folder

```bash
cd chrome-extension/assets
# Make sure these files exist:
ls icon16.png icon48.png icon128.png
```

### Overlay not showing in Google Meet

1. Refresh Google Meet page (F5)
2. Check extension is enabled
3. Open Console (F12) and look for:

   ```
   Meeting AI Assistant: Content script loaded
   ```

4. If not there, reload extension

### "Failed to start recording"

1. Make sure you clicked "Share" in permission dialog
2. Select the correct Google Meet tab
3. Check "Share audio" is checked
4. Try again

### Network/API Errors

1. Verify web app is running:

   ```bash
   curl http://localhost:3000/
   # Should return HTML
   ```

2. Check API is accessible:

   ```bash
   # This will fail but should connect
   curl http://localhost:3000/api/transcribe
   ```

3. Check OpenAI key in web app:

   ```bash
   cd meeting-ai
   cat .env.local
   # Should show: OPENAI_API_KEY=sk-...
   ```

## Uninstallation

To remove extension:

1. Go to chrome://extensions/
2. Click "Remove" on Meeting AI Assistant
3. Confirm removal

To reinstall, follow installation steps again.

## Next Steps

After successful installation:

1. ? Read [README.md](README.md) for full features
2. ? Join a real Google Meet to test
3. ? Review [../meeting-ai/README.md](../meeting-ai/README.md) for web app docs
4. ? Check [USAGE_GUIDE.md](USAGE_GUIDE.md) for tips

## Quick Reference

| Action | Command/Location |
|--------|------------------|
| Extensions page | chrome://extensions/ |
| Reload extension | Click ?? in chrome://extensions/ |
| Debug extension | F12 in Google Meet tab |
| View logs | Console in DevTools |
| Extension popup | Click icon in toolbar |
| Web app | <http://localhost:3000> |

## Success Checklist ?

- [ ] Web app running on localhost:3000
- [ ] Extension loaded in Chrome
- [ ] No errors in chrome://extensions/
- [ ] Icons present in assets/ folder
- [ ] Overlay appears in Google Meet
- [ ] Can start/stop recording
- [ ] Processing completes successfully
- [ ] Results show in popup

**All checked? You're ready to use Meeting AI! ??**

---

**Need help?** Check [README.md](README.md) or open an issue on GitHub.
