# Meeting AI Assistant ???

Transform your meeting recordings into actionable insights with AI-powered transcription and analysis.

## Features ?

- **Audio/Video Upload**: Support for MP3, WAV, M4A, MP4, WebM formats (up to 25MB)
- **AI Transcription**: Powered by OpenAI Whisper with timestamp granularity
- **Smart Analysis**: GPT-4 extracts:
  - 5-7 key summary points
  - Action items with assignees (auto-detected from transcript)
  - Key decisions made
  - Participant list
- **Professional PDF Reports**: Download formatted PDF with all meeting details
- **Modern UI**: Clean, responsive interface with progress tracking
- **Cost Effective**: ~$0.40 per 60-minute meeting

## Tech Stack ???

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **AI**: OpenAI Whisper & GPT-4
- **PDF**: jsPDF with auto-table
- **Icons**: Lucide React

## Getting Started ??

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone and navigate to the project:**

   ```bash
   cd meeting-ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment variables:**

   Create a `.env.local` file in the root directory:

   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage ??

1. **Upload Recording**: Drag and drop your audio/video file or click to browse
2. **Wait for Processing**: The app will:
   - Transcribe audio using Whisper AI
   - Analyze content with GPT-4
   - Generate insights
3. **Review Results**: Browse through:
   - Meeting Summary
   - Action Items with assignees
   - Key Decisions
   - Full Transcript with timestamps
4. **Download PDF**: Get a professional report for sharing

## Cost Estimation ??

| Duration | Whisper Cost | GPT-4 Cost | Total |
|----------|--------------|------------|-------|
| 15 min   | $0.09        | $0.02      | ~$0.11|
| 30 min   | $0.18        | $0.02      | ~$0.20|
| 60 min   | $0.36        | $0.04      | ~$0.40|

**Free tier**: OpenAI provides $5 credit = ~12 meetings (60 min each)

## Project Structure ??

```
meeting-ai/
??? app/
?   ??? api/
?   ?   ??? transcribe/       # Whisper API integration
?   ?   ??? analyze/          # GPT-4 analysis
?   ?   ??? generate-pdf/     # PDF generation
?   ??? page.tsx              # Main application page
?   ??? layout.tsx
??? components/
?   ??? FileUpload.tsx        # Drag & drop upload
?   ??? ProcessingStatus.tsx # Progress indicator
?   ??? ResultDisplay.tsx    # Results with tabs
?   ??? ui/                   # Reusable UI components
??? lib/
?   ??? openai.ts            # OpenAI client
?   ??? pdf-generator.ts     # PDF generation logic
?   ??? utils.ts             # Utility functions
??? types/
    ??? index.ts             # TypeScript interfaces
```

## API Routes ??

### POST /api/transcribe

Transcribes audio/video files using OpenAI Whisper.

**Request**: FormData with `file`
**Response**: Transcript with segments and timestamps

### POST /api/analyze

Analyzes transcript using GPT-4 to extract insights.

**Request**: JSON with `transcript`
**Response**: Summary, action items, decisions, participants

### POST /api/generate-pdf

Generates PDF report from meeting data.

**Request**: JSON with full meeting result
**Response**: PDF file download

## Environment Variables ??

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ? Yes |

## Deployment ??

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `OPENAI_API_KEY` environment variable
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

## Roadmap ???

### Phase 1: MVP (Current) ?

- [x] File upload interface
- [x] Whisper transcription
- [x] GPT-4 analysis
- [x] PDF generation
- [x] Modern UI

### Phase 2: Chrome Extension (Coming Soon)

- [ ] Real-time audio capture from Google Meet
- [ ] Live transcription during meetings
- [ ] In-meeting overlay UI
- [ ] Automatic recording start/stop

### Phase 3: Advanced Features

- [ ] User authentication
- [ ] Meeting history & storage
- [ ] Team collaboration
- [ ] Integration with Slack, Notion, Jira
- [ ] Multi-language support
- [ ] Custom AI prompts

## Troubleshooting ??

### "Invalid OpenAI API key"

- Verify your API key in `.env.local`
- Ensure you have credits in your OpenAI account

### "File too large"

- Whisper API has a 25MB limit
- Compress your audio file or split longer recordings

### API timeout

- Very long files may timeout (5 min limit)
- Consider splitting files > 60 minutes

## Contributing ??

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## License ??

MIT License - feel free to use this project for personal or commercial purposes.

## Support ??

For questions or issues, please open an issue on GitHub.

---

Built with ?? using Next.js, TypeScript, and OpenAI
