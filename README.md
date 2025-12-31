# MeetingMind AI

Transform your meeting recordings into actionable insights with AI-powered transcription and analysis.

## Overview

MeetingMind AI is an intelligent meeting assistant that automatically transcribes audio/video recordings and extracts key insights using advanced AI. It helps teams capture, analyze, and act on meeting content efficiently.

**Who it's for:** Teams, project managers, and professionals who want to extract actionable information from meetings without manual note-taking.

**Key value proposition:** Save time by automatically generating meeting summaries, action items, and decisions with professional PDF reports ready for sharing.

## Key Features

- **Upload & Analyze Meeting Recordings** - Support for MP3, WAV, M4A, MP4, WebM formats (up to 25MB)
- **AI Transcription** - Powered by OpenAI Whisper with timestamp granularity and segment-level transcription
- **Comprehensive AI Analysis** - GPT-4 extracts structured meeting insights:
  - **Attendance Tracking** - Present and absent members with reasons
  - **Personal Progress Updates** - Yesterday's completed work, today's planned tasks, and blockers for each member
  - **Workload Assessment** - Automatic workload status (overloaded/normal/free) for each team member
  - **Action Items** - Tasks with assignees, due dates, priority levels, and technical notes
  - **Key Decisions** - Important decisions made during the meeting
  - **Meeting Summary** - Blockers to follow up, priority tasks, and responsibilities with deadlines
- **PDF Report Generation** - Download professional formatted PDFs with all meeting details
- **Meeting History** - Browse, search, filter, and sort past meetings with full transcript access and detailed view
- **Chrome Extension** - Real-time audio capture and transcription for Google Meet
- **Multi-language Support** - UI available in English, Vietnamese, and Japanese (transcript language is separate from UI language)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **AI:** OpenAI Whisper (transcription), GPT-4 (analysis)
- **Database:** PostgreSQL + Prisma ORM
- **PDF Generation:** jsPDF with auto-table
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- PostgreSQL database (local or cloud)

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

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/meeting_ai
   API_BASE_URL=http://localhost:3000/api
   ```

4. **Setup database:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push
   ```

5. **Generate Chrome Extension config (if using extension):**

   ```bash
   npm run generate:extension-config
   ```

6. **Run the development server:**

   ```bash
   npm run dev
   ```

7. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload a meeting recording** - Drag and drop or select an audio/video file
2. **Select transcript language** - Choose the language of the meeting (English, Vietnamese, or Japanese)
3. **Wait for processing** - The app will:
   - Transcribe audio using Whisper AI
   - Analyze content with GPT-4 to extract structured insights
   - Save to database automatically
4. **Review results** - Browse through 6 detailed tabs:
   - **Overview** - Attendance and workload status
   - **Progress** - Personal updates from each team member
   - **Tasks** - Action items with assignees and deadlines
   - **Decisions** - Key decisions made
   - **Summary** - Blockers, priorities, and responsibilities
   - **Transcript** - Full transcript with timestamps and search functionality
5. **Download PDF** - Generate a professional report for sharing
6. **View history** - Access past meetings with filtering and search capabilities

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key for Whisper and GPT-4 | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `API_BASE_URL` | Base URL for API endpoints (used by Chrome extension) | Optional (defaults to localhost:3000) |

**Note:** Never commit `.env.local` to version control. Add it to `.gitignore`.

## License

Private project - All rights reserved.

---

Built with Next.js, TypeScript, and OpenAI
