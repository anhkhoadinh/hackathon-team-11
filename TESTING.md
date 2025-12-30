# Testing Guide for Meeting AI Assistant

## Setup for Testing

1. **Set OpenAI API Key**

   ```bash
   # Create .env.local file
   echo "OPENAI_API_KEY=your_actual_api_key_here" > .env.local
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to <http://localhost:3000>

## Test Scenarios

### ? Test 1: File Upload Validation

**Purpose**: Verify file validation works correctly

**Steps**:

1. Try uploading a file > 25MB
   - Expected: Error message "File size exceeds 25MB limit"

2. Try uploading an invalid file type (e.g., .txt, .pdf)
   - Expected: Error message about supported formats

3. Upload a valid audio file (MP3, WAV, M4A)
   - Expected: File preview with size and estimated cost

**Sample Audio Files to Use**:

- Short (1-2 min): Quick test, low cost (~$0.01)
- Medium (5-10 min): Realistic meeting segment (~$0.05-0.10)
- Long (30-60 min): Full meeting simulation (~$0.20-0.40)

You can create test audio files or download free samples from:

- <https://freesound.org/>
- <https://www.soundjay.com/>
- Record your own voice memo

---

### ? Test 2: Processing Flow

**Purpose**: Verify the complete transcription and analysis pipeline

**Steps**:

1. Upload a valid audio file
2. Click "Process Meeting Recording"
3. Observe processing steps:
   - ? Uploading file
   - ? Transcribing audio (takes 1-3 min for 5min audio)
   - ? Analyzing content
   - ? Generating PDF
   - ? Done!

**Expected Results**:

- All steps complete successfully with green checkmarks
- No errors displayed
- Results page displays

---

### ? Test 3: Transcription Accuracy

**Purpose**: Verify transcription quality

**Test Case 1: Clear English Speech**

- Record/upload clear English audio
- Expected: High accuracy transcription
- Check: Timestamps are present and accurate

**Test Case 2: Multiple Speakers**

- Upload audio with multiple speakers
- Expected: All speakers transcribed
- Check: Participants list includes detected speakers

**Test Case 3: Technical Terminology**

- Upload audio mentioning technical terms (API, database, React, etc.)
- Expected: Technical terms transcribed correctly

---

### ? Test 4: AI Analysis Quality

**Purpose**: Verify GPT-4 extracts correct insights

**Create test audio that includes**:

1. **Summary Points** - Discuss 5-7 main topics
2. **Action Items** - Explicitly say things like:
   - "John will implement the login feature"
   - "Sarah needs to review the database schema"
   - "Mike should update the documentation"
3. **Key Decisions** - Make clear decisions:
   - "We decided to use PostgreSQL instead of MongoDB"
   - "The deadline is set for next Friday"
4. **Participants** - Mention names multiple times

**Expected Results**:

- Summary tab: 5-7 coherent bullet points
- Action Items tab: Tasks with correct assignees
- Decisions tab: Key decisions listed
- Full Transcript: Complete text with timestamps

---

### ? Test 5: PDF Generation

**Purpose**: Verify PDF download works and is well-formatted

**Steps**:

1. Complete a full processing flow
2. Click "Download PDF" button
3. Open the downloaded PDF

**Expected PDF Content**:

- Header with file info and date
- Summary section with bullet points
- Action Items table with assignees
- Key Decisions section
- Participants list
- Full transcript with timestamps
- Professional formatting

---

### ? Test 6: UI/UX Flow

**Purpose**: Verify user experience is smooth

**Drag & Drop**:

- Drag file over upload area
- Expected: Visual feedback (blue highlight)

**Copy to Clipboard**:

- Click copy button on any section
- Expected: "Copied" confirmation appears

**Tab Navigation**:

- Click through all tabs: Summary, Action Items, Decisions, Transcript
- Expected: Smooth transitions, correct content in each tab

**Process Another**:

- Click "Process Another" button
- Expected: Return to upload page, state reset

---

### ? Test 7: Error Handling

**Purpose**: Verify errors are handled gracefully

**Test Case 1: Invalid API Key**

```bash
# Set invalid key
OPENAI_API_KEY=invalid_key
```

- Expected: Clear error message "Invalid OpenAI API key"

**Test Case 2: Network Interruption**

- Start processing, then disable network
- Expected: Error message with "Try again" option

**Test Case 3: Rate Limit (if hit)**

- Make multiple rapid requests
- Expected: Rate limit error with helpful message

---

### ? Test 8: Cost Calculation

**Purpose**: Verify cost estimates are accurate

**Test Files**:

- 1 minute audio ? ~$0.01
- 10 minute audio ? ~$0.08
- 60 minute audio ? ~$0.40

**Check**:

- Preview shows estimated cost before processing
- Final cost matches estimate (±10%)

---

### ? Test 9: Multiple Languages (Bonus)

**Purpose**: Test Whisper's multi-language support

**Test with**:

- Vietnamese audio
- English audio
- Mixed language audio

**Expected**: Transcription works for all languages

---

### ? Test 10: Edge Cases

**Empty/Silent Audio**:

- Upload silent audio file
- Expected: Transcript says "(No speech detected)" or minimal text

**Very Short Audio (< 10 seconds)**:

- Expected: Still processes, minimal insights

**Music/Non-Speech**:

- Upload music file
- Expected: Transcription attempts, analysis may be limited

---

## Performance Benchmarks

| File Duration | Expected Processing Time | Cost |
|--------------|-------------------------|------|
| 1 min        | 10-20 seconds          | $0.01 |
| 5 min        | 30-60 seconds          | $0.05 |
| 15 min       | 1-2 minutes            | $0.12 |
| 30 min       | 2-4 minutes            | $0.22 |
| 60 min       | 4-8 minutes            | $0.40 |

---

## Known Limitations

1. **File Size**: Max 25MB (Whisper API limit)
2. **Processing Time**: Long files may timeout (5 min API limit)
3. **Cost**: Each processing costs real money
4. **Accuracy**: Depends on audio quality
5. **Languages**: Best with English, supports 50+ languages

---

## Debugging Tips

**If transcription fails**:

- Check audio file is not corrupted
- Verify file format is supported
- Check OpenAI account has credits

**If analysis is poor**:

- Check audio quality and clarity
- Ensure speakers mention names clearly
- Record test audio with explicit action items

**If PDF download fails**:

- Check browser allows downloads
- Try different browser
- Check console for errors

---

## Testing Checklist

Before considering MVP complete, verify:

- [ ] File upload works with all supported formats
- [ ] Drag & drop functionality works
- [ ] File size validation works
- [ ] Processing completes end-to-end
- [ ] Transcription is accurate
- [ ] Action items are extracted correctly
- [ ] Assignees are detected from names in transcript
- [ ] Key decisions are identified
- [ ] Participants list is accurate
- [ ] PDF downloads successfully
- [ ] PDF is well-formatted
- [ ] All tabs display correct content
- [ ] Copy to clipboard works
- [ ] "Process Another" resets state
- [ ] Error messages are clear and helpful
- [ ] Cost estimates are accurate
- [ ] UI is responsive on mobile
- [ ] Build succeeds without errors
- [ ] No console errors in browser

---

## Sample Test Script (Audio to Record)

```
Title: Sprint Planning Meeting

[Person 1 - John]: "Hi everyone, thanks for joining. Let's discuss our sprint planning for the next two weeks."

[Person 2 - Sarah]: "Sure! I've reviewed the backlog. We have three major features to implement."

[John]: "Great. Sarah, can you take the lead on the authentication feature? That's our highest priority."

[Sarah]: "Absolutely. I'll implement OAuth2 integration and have it ready by Friday."

[Person 3 - Mike]: "I can work on the database optimization. We decided last week to migrate from MongoDB to PostgreSQL, right?"

[John]: "Yes, that's a key decision. Mike, please handle the migration and Sarah will review your schema changes."

[Sarah]: "I'll also need Mike to update the API documentation once the database changes are done."

[Mike]: "Got it. I'll have the documentation updated by next Monday."

[John]: "Perfect. So to summarize: 
1. Sarah implements OAuth2 authentication by Friday
2. Mike handles PostgreSQL migration this week  
3. Mike updates API docs by Monday
4. Sarah reviews database schema changes
5. We'll have a demo on Friday afternoon"

[Sarah]: "One more thing - we decided to use TailwindCSS for the frontend, correct?"

[John]: "Yes, that's confirmed. It's in the meeting notes from last week."

[Mike]: "Sounds good. I'm excited to get started."

[John]: "Great! Let's make it happen. Meeting adjourned."
```

This script includes:

- Multiple speakers (John, Sarah, Mike)
- Clear action items with assignees
- Key decisions (MongoDB ? PostgreSQL, TailwindCSS)
- Summary points
- Realistic meeting flow

Record this and use it as your primary test file!
