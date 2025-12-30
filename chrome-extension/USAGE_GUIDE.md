# Usage Guide - Meeting AI Chrome Extension

H??ng d?n s? d?ng chi ti?t Chrome Extension ?? record và analyze meetings t? Google Meet.

## ?? Use Cases

### 1. Daily Standup

- Join daily standup trên Meet
- Click "Start Recording" khi b?t ??u
- Nói rõ tên ng??i và blockers
- Stop khi k?t thúc
- Share PDF summary v?i team

### 2. Client Meeting

- Record toàn b? requirements discussion
- AI extract action items t? ??ng
- Có transcript ?? reference sau này
- Share PDF v?i client làm meeting minutes

### 3. Technical Discussion

- Capture architecture decisions
- L?u l?i technical details
- D? dàng review l?i discussion
- Assign tasks cho developers

## ?? Step-by-Step Workflow

### Before Meeting

1. **Start Web App**

   ```bash
   cd meeting-ai
   npm run dev
   ```

2. **Check Extension**
   - Click extension icon
   - Verify "Ready to Record" status

3. **Join Google Meet**
   - Vào <https://meet.google.com/>
   - Join ho?c start meeting
   - Wait for overlay to appear

### During Meeting

1. **Start Recording**
   - Click "Start Recording" trong overlay
   - Permission dialog xu?t hi?n
   - Click "Share" và select Google Meet tab
   - ? Check "Share audio" checkbox
   - Click "Share" l?i

2. **Monitor Recording**
   - Overlay shows "Recording..." v?i timer
   - Transcript appears trong overlay (future feature)
   - Overlay có th? kéo ??n v? trí khác

3. **Continue Meeting Normally**
   - Extension ch?y ? background
   - Không ?nh h??ng Meeting performance
   - Có th? minimize overlay n?u c?n

### After Meeting

1. **Stop Recording**
   - Click "Stop Recording"
   - Overlay shows "Processing..."
   - Wait 1-5 minutes (depends on length)

2. **View Results**
   - Notification xu?t hi?n khi xong
   - Click extension icon
   - See meeting stats
   - Click "View Details" for full results

3. **Download PDF (Optional)**
   - Click "Open Web App" trong popup
   - Results ?ã ???c l?u
   - Click "Download PDF" ?? export

## ?? Tips for Best Results

### Audio Quality

**? DO:**

- Use headphones v?i microphone t?t
- Join t? quiet environment
- Speak clearly và không quá nhanh
- Ensure stable internet connection

**? DON'T:**

- Record trong environment ?n
- Use builtin laptop mic (n?u có option khác)
- Talk over other people
- Let music/notifications play

### Mention Names

**? GOOD:**

```
"John s? implement authentication feature"
"Sarah needs to review the pull request"
"Mike will update documentation by Friday"
```

**? BAD:**

```
"You s? làm authentication"
"Ai ?ó review PR nhé"
"C?n update docs"
```

### State Decisions Clearly

**? GOOD:**

```
"We decided to use PostgreSQL instead of MongoDB"
"Team agrees to deploy on Friday"
"We will not implement feature X for v1.0"
```

**? BAD:**

```
"Có l? dùng cái kia"
"Ok, thôi làm v?y"
"Không bi?t, xem sao"
```

### Structure Your Meeting

**Best practice:**

1. **Intro** (30s): "Today we'll discuss A, B, C"
2. **Main discussion** (bulk of meeting)
3. **Action items** (5 min): "John will X, Sarah will Y"
4. **Wrap up** (1 min): "Meeting adjourned"

Structured meetings ? Better AI analysis

## ??? Extension Controls

### Overlay UI

**Header (Purple bar)**

- Drag to move overlay
- "?" button: Minimize
- "+" button: Restore

**Status Section**

- Shows current state: Ready/Recording/Processing
- Timer: Shows recording duration

**Controls**

- "Start Recording": Begin capture
- "Stop Recording": End and process

**Transcript Section**

- Real-time transcript display (future)
- Scrollable area
- Timestamps for each segment

### Extension Popup

**Last Meeting Card**

- Date và duration
- Stats: Summary points, Tasks, Decisions
- "View Details": Open modal v?i full results

**Quick Actions**

- "Open Web App": Open <http://localhost:3000>
- "Settings": Configure extension

## ?? Understanding Results

### Summary

- 5-7 bullet points
- Key topics discussed
- Main takeaways

**Example:**

```
1. Discussed authentication implementation approach
2. Reviewed database schema changes
3. Decided on deployment timeline
4. Identified blockers for sprint
5. Planned next sprint goals
```

### Action Items

- Tasks mentioned in meeting
- Auto-assigned to people
- Format: Task - @Person

**Example:**

```
? Implement OAuth2 login - John
? Review database migration - Sarah
? Update API documentation - Mike
```

### Key Decisions

- Important decisions made
- Changes in direction
- Agreements reached

**Example:**

```
?? Decided to migrate from MongoDB to PostgreSQL
?? Will deploy to production on Friday
?? Using TailwindCSS for frontend styling
```

### Full Transcript

- Complete text c?a meeting
- Có timestamps
- Searchable

**Example:**

```
[0:32] Hi everyone, thanks for joining
[1:15] Today we need to discuss three things
[2:45] First, let's talk about authentication
...
```

## ?? Customization

### Move Overlay

- Click và drag header (purple bar)
- Move to comfortable position
- Position is saved for next meeting

### Minimize When Not Needed

- Click "?" to minimize
- Only header visible
- Click "+" to restore

### Change API URL

For production deployment:

1. Edit `scripts/content.js`:

   ```javascript
   const API_BASE_URL = 'https://your-domain.com/api';
   ```

2. Reload extension trong chrome://extensions/

## ?? Common Issues & Solutions

### Issue: Overlay không xu?t hi?n

**Solution:**

```bash
# 1. Check extension enabled
chrome://extensions/ ? Toggle on

# 2. Refresh Google Meet
Press F5

# 3. Check console logs
F12 ? Console tab
Look for: "Meeting AI Assistant: Content script loaded"
```

### Issue: "Failed to start recording"

**Solution:**

1. Ensure you clicked "Share" trong permission dialog
2. Select correct Google Meet tab (có audio icon)
3. ? Check "Share audio" checkbox
4. Không check "Share tab instead of entire screen"

### Issue: Recording nh?ng không có audio

**Solution:**

1. Re-do permission: Stop và Start l?i
2. Ensure microphone working trong Meet
3. Check "Share audio" ???c checked
4. Select tab, không ph?i entire screen

### Issue: Processing quá lâu

**Normal processing time:**

- 1 min recording = 30s process
- 5 min recording = 1-2 min process
- 30 min recording = 5-10 min process

**If stuck > 10 minutes:**

1. Check web app still running
2. Check OpenAI API key valid
3. Check internet connection
4. Open DevTools (F12) ? Network tab ? See errors

### Issue: Results không accurate

**Improve accuracy:**

1. ? Better audio quality (use headphones)
2. ? Speak clearly v?i proper pace
3. ? Mention names explicitly
4. ? State action items clearly
5. ? Avoid crosstalk

## ?? Monitoring & Debugging

### View Extension Logs

**Content Script (runs in Meet page):**

```
F12 ? Console tab
Filter: "Meeting AI"
```

**Background Worker:**

```
chrome://extensions/
Find "Meeting AI Assistant"
Click "service worker" link
Console will open
```

**Network Requests:**

```
F12 ? Network tab
Filter: "api"
See transcribe, analyze calls
```

### Check Recorded Audio

Audio is stored temporarily:

- Format: WebM
- Location: Chrome memory (not saved to disk)
- Sent to API after stop recording

### API Response Times

Typical times:

- Transcription: 0.5-2 min (depends on length)
- Analysis: 10-30 seconds
- PDF generation: 1-2 seconds

## ?? Advanced Usage

### Batch Processing

Process multiple meetings:

1. Record meeting 1 ? Wait for completion
2. Record meeting 2 ? Wait for completion
3. Access all results in web app

### Export to Other Tools

From web app:

1. Download PDF
2. Share PDF link
3. Copy transcript ? Paste to Notion/Slack
4. Copy action items ? Paste to Jira

### Team Workflow

1. **Meeting Owner**: Records meeting v?i extension
2. **Auto-process**: AI creates summary + tasks
3. **Share PDF**: Send to team members
4. **Track Tasks**: Use action items list
5. **Reference**: Full transcript available

## ?? Best Practices

### Before Meeting

- [ ] Start web app
- [ ] Test extension working
- [ ] Check audio setup
- [ ] Join meeting early

### During Meeting

- [ ] Start recording immediately
- [ ] Mention names when assigning tasks
- [ ] State decisions clearly
- [ ] Keep overlay visible for monitoring

### After Meeting

- [ ] Stop recording promptly
- [ ] Wait for processing to complete
- [ ] Review results for accuracy
- [ ] Share PDF with team
- [ ] Follow up on action items

## ?? Success Metrics

Good meeting recording should have:

- ? Clear audio quality
- ? 5-7 summary points extracted
- ? All action items captured with assignees
- ? Key decisions documented
- ? Participants list accurate
- ? Transcript readable and accurate

## ?? FAQ

**Q: Có c?n record c? video không?**
A: Không, ch? c?n audio. Extension ch? capture audio.

**Q: Ng??i khác trong meeting có bi?t ?ang record không?**
A: Google Meet không t? notify. B?n nên inform team.

**Q: Recording có ???c l?u ?âu không?**
A: Không l?u audio file. Ch? l?u transcript và analysis.

**Q: Chi phí bao nhiêu?**
A: ~$0.40 cho 60 phút meeting (OpenAI API cost)

**Q: Có support ti?ng Vi?t không?**
A: Có! Whisper support Vietnamese.

**Q: Làm sao export sang Notion?**
A: Copy transcript t? results ? Paste to Notion page.

**Q: Extension có ho?t ??ng offline không?**
A: Không. C?n internet ?? call OpenAI APIs.

## ?? Get Help

Issues? Check these:

1. [README.md](README.md) - Full documentation
2. [INSTALLATION.md](INSTALLATION.md) - Setup guide
3. Console logs (F12) - Technical errors
4. GitHub Issues - Report bugs

---

**Ready to transform your meetings?** ??  
Start recording and let AI do the heavy lifting!
