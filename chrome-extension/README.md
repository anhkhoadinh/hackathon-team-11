# Meeting AI Assistant - Chrome Extension

Chrome Extension ?? capture và transcribe meetings t? Google Meet in real-time.

## ? Features

- ??? **Real-time Audio Capture** - Record audio tr?c ti?p t? Google Meet
- ?? **Live Transcription** - Transcribe meeting trong khi ?ang di?n ra
- ?? **AI Analysis** - T? ??ng t?o summary, action items, key decisions
- ?? **In-Meeting Overlay** - UI overlay trong Google Meet tab
- ?? **Meeting History** - L?u và xem l?i meetings ?ã record
- ?? **Notifications** - Thông báo khi processing xong

## ?? Requirements

1. **Chrome Browser** (version 88+)
2. **Meeting AI Web App** ph?i ?ang ch?y (<http://localhost:3000>)
3. **OpenAI API Key** ?ã setup trong web app

## ?? Installation

### Step 1: Build Web App

```bash
# Ch?y web app tr??c
cd ../meeting-ai
npm run dev
# Web app s? ch?y ? http://localhost:3000
```

### Step 2: Load Extension vào Chrome

1. M? Chrome và vào: `chrome://extensions/`
2. B?t **"Developer mode"** (góc trên bên ph?i)
3. Click **"Load unpacked"**
4. Ch?n folder `chrome-extension` này
5. Extension s? xu?t hi?n trong toolbar

### Step 3: Create Icons (Temporary)

Extension c?n icons. T?o t?m 3 files PNG:

```bash
# Trong folder chrome-extension/assets/
# T?o 3 files: icon16.png, icon48.png, icon128.png
# Ho?c download icon t?: https://www.flaticon.com/
```

**Ho?c dùng placeholder icons này:**

- Copy b?t k? icon PNG nào và rename thành icon16.png, icon48.png, icon128.png
- ??t trong folder `assets/`

## ?? How to Use

### 1. Join Google Meet

1. Vào <https://meet.google.com/>
2. Join ho?c t?o meeting m?i
3. Extension overlay s? t? ??ng xu?t hi?n ? góc ph?i

### 2. Start Recording

1. Click nút **"Start Recording"** trong overlay
2. Cho phép capture audio khi browser yêu c?u
3. Ch?n tab Google Meet ?? record
4. Recording s? b?t ??u

### 3. View Real-time Transcript

- Transcript s? hi?n th? trong overlay
- Có timestamps cho m?i segment
- Scroll ?? xem history

### 4. Stop & Process

1. Click **"Stop Recording"** khi meeting k?t thúc
2. Extension s?:
   - Transcribe toàn b? audio
   - Analyze v?i GPT-4
   - T?o summary + action items
3. Notification s? xu?t hi?n khi xong

### 5. View Results

- Click extension icon trong toolbar
- Xem last meeting stats
- Click **"View Details"** ?? xem ??y ??
- Ho?c m? web app ?? download PDF

## ?? Features Detail

### Floating Overlay

- **Draggable**: Kéo overlay ??n v? trí b?n mu?n
- **Minimizable**: Click "?" ?? minimize
- **Real-time status**: Hi?n th? tr?ng thái recording
- **Timer**: ??m th?i gian recording

### Audio Capture

- S? d?ng `getDisplayMedia` API
- Capture audio t? tab Google Meet
- Support echo cancellation & noise suppression
- Format: WebM audio

### API Integration

Extension connect ??n web app APIs:

- `POST /api/transcribe` - Transcription
- `POST /api/analyze` - AI Analysis
- `POST /api/generate-pdf` - PDF Generation

### Storage

Chrome Storage l?u:

- Last meeting data
- Settings (API URL, auto-start, notifications)
- Meeting history (future feature)

## ?? Configuration

### Change API URL

N?u deploy web app lên production:

1. M? file `scripts/content.js`
2. Tìm dòng:

   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

3. ??i thành URL deployed c?a b?n:

   ```javascript
   const API_BASE_URL = 'https://your-domain.vercel.app/api';
   ```

### Permissions

Extension c?n:

- `activeTab`: Truy c?p tab hi?n t?i
- `storage`: L?u settings và data
- `scripting`: Inject scripts vào Meet
- `meet.google.com`: Ch? ch?y trên Google Meet

## ?? Troubleshooting

### Overlay không xu?t hi?n

1. Refresh l?i trang Google Meet
2. Check extension ?ã enabled ch?a
3. Xem console logs (F12)

### "Failed to start recording"

1. ??m b?o ?ã allow audio capture permission
2. Ch?n ?úng tab Google Meet khi popup xu?t hi?n
3. Check microphone không b? block b?i browser

### "Processing failed"

1. Ki?m tra web app ?ang ch?y (<http://localhost:3000>)
2. Check OpenAI API key trong web app
3. Xem network tab trong DevTools

### Recording không có âm thanh

1. Ensure ch?n tab có audio trong permission popup
2. Check "Share audio" ???c tick
3. Test microphone trong Google Meet tr??c

## ?? Project Structure

```
chrome-extension/
??? manifest.json              # Extension config (Manifest V3)
??? scripts/
?   ??? content.js            # Main logic, runs in Meet pages
?   ??? background.js         # Background service worker
?   ??? injected.js           # (Future) Inject deeper into Meet
??? styles/
?   ??? overlay.css           # Overlay UI styles
??? popup/
?   ??? popup.html            # Extension popup
?   ??? popup.css             # Popup styles
?   ??? popup.js              # Popup logic
??? assets/
?   ??? icon16.png            # Small icon
?   ??? icon48.png            # Medium icon
?   ??? icon128.png           # Large icon
??? README.md                 # This file
```

## ?? Development

### Debug Extension

1. Vào `chrome://extensions/`
2. Click **"Errors"** n?u có l?i
3. Click **"background page"** ?? debug service worker
4. F12 trong Google Meet tab ?? debug content script

### Reload Extension

Sau khi edit code:

1. Vào `chrome://extensions/`
2. Click reload icon (??) trên extension
3. Refresh trang Google Meet

### View Logs

```javascript
// Content script logs
console.log('Meeting AI:', message);

// Background worker logs
// Click "service worker" link in chrome://extensions/
```

## ?? Customization

### Change Colors

Edit `styles/overlay.css`:

```css
.meeting-ai-header {
  background: linear-gradient(135deg, #your-color 0%, #your-color 100%);
}
```

### Change Overlay Position

Edit `scripts/content.js`:

```javascript
overlay.style.top = '20px';  // Change position
overlay.style.right = '20px';
```

## ?? Publishing (Future)

?? publish lên Chrome Web Store:

1. Create icons (professional quality)
2. Add screenshots và description
3. Pay $5 registration fee
4. Submit for review
5. Wait 1-2 days for approval

## ?? Known Limitations

1. **File Size**: Audio file > 25MB s? fail (Whisper limit)
2. **Processing Time**: Meetings dài có th? m?t 5-10 phút
3. **Permissions**: User ph?i manually allow audio capture m?i l?n
4. **Browser**: Ch? support Chrome/Edge (Chromium-based)
5. **Meet Only**: Ch? ho?t ??ng v?i Google Meet (ch?a support Zoom, Teams)

## ?? Future Features

- [ ] Auto-start recording khi join meeting
- [ ] Real-time streaming transcription (hi?n t?i process sau khi stop)
- [ ] Support Zoom, Microsoft Teams
- [ ] Export to Notion, Slack, Jira
- [ ] Meeting analytics dashboard
- [ ] Team collaboration features
- [ ] Custom AI prompts

## ?? Tips

1. **Test v?i meeting ng?n tr??c** (1-2 phút) ?? verify setup
2. **??m b?o internet ?n ??nh** khi recording
3. **?óng tabs không c?n thi?t** ?? gi?m CPU usage
4. **Dùng headphone** ?? audio rõ h?n
5. **Nói rõ tên ng??i** khi assign tasks

## ?? Support

N?u g?p v?n ??:

1. Check README này tr??c
2. Xem console logs (F12)
3. Test web app riêng tr??c
4. Open issue trên GitHub

## ?? License

MIT License - Free to use and modify

---

**Built for** hackathon-team-11  
**Repo**: <https://github.com/anhkhoadinh/hackathon-team-11>
