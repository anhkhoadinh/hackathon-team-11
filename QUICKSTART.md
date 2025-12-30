# Quick Start Guide - Meeting AI Assistant ??

Get your Meeting AI Assistant running in **5 minutes**!

## Prerequisites

- ? Node.js 18+ installed
- ? OpenAI API account ([Sign up free](https://platform.openai.com))

---

## Step 1: Get OpenAI API Key (2 minutes)

1. Go to <https://platform.openai.com/api-keys>
2. Click **"Create new secret key"**
3. Name it: `meeting-ai-dev`
4. Copy the key (starts with `sk-...`)
5. **Important**: OpenAI gives you **$5 free credit** = ~12 meetings!

---

## Step 2: Setup Project (2 minutes)

```bash
# Navigate to project
cd /Users/khoada/Documents/hackathon-team-11/meeting-ai

# Create environment file
echo "OPENAI_API_KEY=your_key_here" > .env.local

# Edit the file and paste your actual API key
nano .env.local
# (or use your favorite text editor)

# Install dependencies (if not already done)
npm install
```

---

## Step 3: Run the App (1 minute)

```bash
# Start development server
npm run dev
```

Open your browser: **<http://localhost:3000>**

?? **You're ready to go!**

---

## First Test (2 minutes)

### Option A: Record Your Voice

1. On your phone/computer, record a short voice memo (1-2 minutes)
2. Say something like:
   > "Hi, I'm [Your Name]. Today we need to discuss three things:
   > First, John will implement the login feature.
   > Second, Sarah needs to review the database.
   > Third, we decided to use PostgreSQL for our database.
   > That's all for today's meeting."
3. Save as MP3 or M4A
4. Upload to the app and click "Process"

### Option B: Download Sample Audio

Download free audio from:

- <https://freesound.org/>
- <https://www.soundjay.com/>
- Or use the test script in [TESTING.md](TESTING.md)

---

## What to Expect

1. **Upload** - Drag & drop your file
2. **Processing** - Takes 30-120 seconds depending on file length
3. **Results** - You'll see:
   - ?? Meeting Summary (5-7 key points)
   - ? Action Items (with assignees)
   - ?? Key Decisions
   - ?? Full Transcript (with timestamps)
4. **Download PDF** - Professional report ready to share

---

## Cost Reference

| Meeting Length | Cost | Your Free Credit |
|---------------|------|-----------------|
| 1 minute      | $0.01 | ? 500 meetings |
| 5 minutes     | $0.05 | ? 100 meetings |
| 15 minutes    | $0.12 | ? 41 meetings  |
| 30 minutes    | $0.22 | ? 22 meetings  |
| 60 minutes    | $0.40 | ? 12 meetings  |

With $5 free credit, you can process about **12 hour-long meetings** for free!

---

## Troubleshooting

### "Invalid API Key" Error

```bash
# Check your .env.local file
cat .env.local

# It should look like:
OPENAI_API_KEY=sk-proj-...actual_key_here...
```

### Port 3000 Already in Use

```bash
# Use a different port
npm run dev -- -p 3001

# Then open: http://localhost:3001
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

---

## Next Steps

After your first successful test:

1. ? Read [TESTING.md](TESTING.md) for comprehensive testing scenarios
2. ? Read [README.md](README.md) for full documentation
3. ? Read [DEPLOYMENT.md](DEPLOYMENT.md) when ready to deploy
4. ? Try the Chrome Extension (Phase 2) when needed

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Run production server

# Linting
npm run lint             # Check code quality
```

---

## Demo Checklist

Before showing to your team:

- [ ] Test with a real meeting recording
- [ ] Verify all sections show data (summary, tasks, decisions)
- [ ] Download and check the PDF quality
- [ ] Prepare explanation of costs (~$0.40/hour)
- [ ] Show the "Process Another" workflow

---

## Tips for Best Results

1. **Audio Quality**: Clear audio = better transcription
2. **Mention Names**: Say names when assigning tasks
   - Good: "John will handle the API integration"
   - Bad: "You will handle the API integration"
3. **Be Explicit**: Clearly state decisions and action items
4. **Multiple Speakers**: Works best with 2-5 speakers
5. **Languages**: Works with Vietnamese and English!

---

## Need Help?

- Check [README.md](README.md) for full documentation
- Check [TESTING.md](TESTING.md) for test scenarios
- Check OpenAI dashboard for API usage
- Review browser console for errors (F12)

---

## Success Criteria

You'll know it's working when you:

1. ? Upload a file without errors
2. ? See processing steps complete
3. ? View meaningful summary and action items
4. ? Download a well-formatted PDF
5. ? See accurate cost estimates

---

**Ready to revolutionize your meeting workflow?** ??

Start your first transcription now!
