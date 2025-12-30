import { NextRequest, NextResponse } from 'next/server';
import { openai, validateApiKey } from '@/lib/openai';
import { MeetingAnalysis } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout

// CORS headers for Chrome Extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const ANALYSIS_PROMPT = `You are an expert meeting analyst. Analyze the following meeting transcript and extract key information.

Analyze the transcript and extract information in these 6 sections:

1. OPENING & ATTENDANCE:
   - List all members who are present
   - List all members who are absent (with reason if mentioned)

2. PERSONAL PROGRESS UPDATES:
   For each member who reported, extract:
   - Yesterday's completed work: List of tasks completed yesterday
   - Today's planned work: List of tasks planned for today
   - Blockers: List of blockers or difficulties (if none, indicate clearly)

3. WORKLOAD ASSESSMENT:
   IMPORTANT: Infer workload status from the context:
   - OVERLOADED: Has blockers, multiple tasks, mentions being busy/overwhelmed, tight deadlines
   - NORMAL: Has standard number of tasks, no major blockers, on track
   - FREE: Completed tasks, available for new work, light workload mentioned
   
   If workload is not explicitly mentioned, INFER it from:
   - Number of tasks (today's work)
   - Presence of blockers
   - Tone/urgency in updates
   
   You MUST assign a status to EACH person who gave an update.

4. NEW TASKS & TASK REALLOCATION:
   For each new task or reassigned task, extract:
   - Task description: Brief description of the task
   - Assignee: Person responsible for the task
   - Deadline/ETA: Extract if mentioned
   - Priority level: high/medium/low if mentioned
   - Technical requirements or notes: Extract if mentioned

5. KEY DECISIONS:
   - Extract important decisions made during the meeting
   - Include: plan changes, technical approach choices, deadline changes

6. SUMMARY & NEXT STEPS:
   - Blockers that need follow-up
   - Priority tasks for today
   - Responsibilities: who is responsible for what, with deadlines if mentioned

IMPORTANT:
- Extract information in the same language as the transcript
- Use exact names as mentioned in the transcript
- If information is not mentioned, use empty arrays or null values
- Be thorough but concise

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "attendance": {
    "present": ["Person1", "Person2"],
    "absent": [{"name": "Person3", "reason": "reason if mentioned"}]
  },
  "personalProgress": [
    {
      "member": "Person1",
      "yesterday": ["task 1", "task 2"],
      "today": ["task 3", "task 4"],
      "blockers": ["blocker 1"] or []
    }
  ],
  "workload": [
    {"member": "Person1", "status": "overloaded"},
    {"member": "Person2", "status": "normal"},
    {"member": "Person3", "status": "free"}
  ],
  "actionItems": [
    {
      "task": "task description",
      "assignee": "PersonName",
      "dueDate": "deadline if mentioned" or null,
      "priority": "high/medium/low" or null,
      "technicalNotes": "notes if mentioned" or null
    }
  ],
  "keyDecisions": ["decision 1", "decision 2"],
  "summary": {
    "blockersToFollowUp": ["blocker 1", "blocker 2"],
    "priorityTasks": ["task 1", "task 2"],
    "responsibilities": [
      {"person": "Person1", "task": "task description", "deadline": "deadline if mentioned" or null}
    ]
  },
  "participants": ["Person1", "Person2", "Person3"]
}`;

export async function POST(request: NextRequest) {
  try {
    // Validate API key at runtime
    validateApiKey();
    
    const body = await request.json();
    const { transcript, language } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Invalid transcript provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Analyzing transcript (${transcript.length} characters)... Language: ${language || 'auto'}`);

    // Enhance prompt based on language if provided
    let enhancedPrompt = ANALYSIS_PROMPT;
    if (language === 'vi') {
      enhancedPrompt += '\n\nIMPORTANT: The transcript is in Vietnamese. Extract ALL information in Vietnamese. Use Vietnamese names properly. Return Vietnamese text for all fields.';
    } else if (language === 'ja') {
      enhancedPrompt += '\n\nIMPORTANT: The transcript is in Japanese. Extract information in Japanese and use Japanese names properly.';
    }

    // Call GPT-4 for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: enhancedPrompt,
        },
        {
          role: 'user',
          content: `Transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const analysis: MeetingAnalysis = JSON.parse(content);

    // Validate the response structure with backward compatibility
    if (!analysis.attendance) {
      analysis.attendance = { present: [], absent: [] };
    }
    if (!analysis.personalProgress || !Array.isArray(analysis.personalProgress)) {
      analysis.personalProgress = [];
    }
    if (!analysis.workload || !Array.isArray(analysis.workload)) {
      analysis.workload = [];
    }
    if (!analysis.actionItems || !Array.isArray(analysis.actionItems)) {
      analysis.actionItems = [];
    }
    if (!analysis.keyDecisions || !Array.isArray(analysis.keyDecisions)) {
      analysis.keyDecisions = [];
    }
    if (!analysis.summary || typeof analysis.summary !== 'object') {
      analysis.summary = {
        blockersToFollowUp: [],
        priorityTasks: [],
        responsibilities: []
      };
    }
    if (!analysis.participants || !Array.isArray(analysis.participants)) {
      // Extract from attendance if not provided
      analysis.participants = analysis.attendance.present || [];
    }

    console.log(`Analysis completed: ${analysis.personalProgress.length} progress updates, ${analysis.actionItems.length} tasks, ${analysis.keyDecisions.length} decisions`);

    return NextResponse.json(analysis, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to analyze transcript' },
      { status: 500, headers: corsHeaders }
    );
  }
}
