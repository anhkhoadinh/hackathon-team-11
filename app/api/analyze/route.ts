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

Your task is to:
1. Create a concise summary with 5-7 main points discussed
2. Identify all action items/tasks mentioned, along with who should do them (if mentioned)
3. Extract key decisions that were made
4. List all participants/people mentioned in the meeting

IMPORTANT for Action Items:
- Look for phrases like "will do", "should do", "needs to", "has to", "responsible for", "assigned to"
- Extract the person's name mentioned near the task
- If no specific person is mentioned, use "Unassigned"

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "actionItems": [
    {"task": "task description", "assignee": "PersonName", "dueDate": null},
    {"task": "another task", "assignee": "AnotherPerson", "dueDate": null}
  ],
  "keyDecisions": ["decision 1", "decision 2"],
  "participants": ["Person1", "Person2", "Person3"]
}`;

export async function POST(request: NextRequest) {
  try {
    // Validate API key at runtime
    validateApiKey();
    
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Invalid transcript provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Analyzing transcript (${transcript.length} characters)...`);

    // Call GPT-4 for analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: ANALYSIS_PROMPT,
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

    // Validate the response structure
    if (!analysis.summary || !Array.isArray(analysis.summary)) {
      analysis.summary = [];
    }
    if (!analysis.actionItems || !Array.isArray(analysis.actionItems)) {
      analysis.actionItems = [];
    }
    if (!analysis.keyDecisions || !Array.isArray(analysis.keyDecisions)) {
      analysis.keyDecisions = [];
    }
    if (!analysis.participants || !Array.isArray(analysis.participants)) {
      analysis.participants = [];
    }

    console.log(`Analysis completed: ${analysis.summary.length} points, ${analysis.actionItems.length} tasks, ${analysis.keyDecisions.length} decisions`);

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

