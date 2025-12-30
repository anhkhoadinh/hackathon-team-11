import { NextRequest, NextResponse } from 'next/server';
import { openai, validateApiKey } from '@/lib/openai';
import { TranscriptSegment } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)

// CORS headers for Chrome Extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/mp4',
  'video/mp4',
  'video/mpeg',
  'audio/webm',
  'video/webm',
];

export async function POST(request: NextRequest) {
  try {
    // Validate API key at runtime
    validateApiKey();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 25MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|mp4|mpeg|webm)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: mp3, wav, m4a, mp4, webm' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Extract segments with timestamps
    const segments: TranscriptSegment[] = (transcription as any).segments?.map((seg: any, index: number) => ({
      id: index,
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })) || [];

    // Calculate duration
    const duration = segments.length > 0 
      ? segments[segments.length - 1].end 
      : 0;

    const response = {
      text: transcription.text,
      segments,
      duration,
      language: (transcription as any).language || 'unknown',
    };

    console.log(`Transcription completed: ${duration.toFixed(2)}s, ${segments.length} segments`);

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (error.status === 413) {
      return NextResponse.json(
        { error: 'File too large for OpenAI API' },
        { status: 413, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500, headers: corsHeaders }
    );
  }
}

