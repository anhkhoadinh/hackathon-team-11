import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/meetings/:id - Get a single meeting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params; // Await params in Next.js 15+
    const id = parseInt(idParam, 10); // Convert to number

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid meeting ID' },
        { status: 400, headers: corsHeaders }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Parse transcript back to object
    let transcript;
    try {
      transcript = JSON.parse(meeting.transcript);
    } catch {
      transcript = { text: meeting.transcript, segments: [], duration: meeting.duration };
    }

    // Debug logging
    console.log('?? Meeting data from DB:', {
      id: meeting.id,
      title: meeting.title,
      summaryType: typeof meeting.summary,
      summaryIsArray: Array.isArray(meeting.summary),
      summary: meeting.summary,
    });

    // Parse analysis from summary field (NEW FORMAT: full analysis object stored as JSON)
    let parsedAnalysis;
    try {
      // If summary is a string, parse it (shouldn't happen with Prisma JSON type, but just in case)
      if (typeof meeting.summary === 'string') {
        parsedAnalysis = JSON.parse(meeting.summary);
      } else {
        parsedAnalysis = meeting.summary;
      }
    } catch (e) {
      console.error('Error parsing summary:', e);
      parsedAnalysis = null;
    }

    // Compatibility layer: Handle both OLD and NEW formats
    let analysis;
    
    if (parsedAnalysis && typeof parsedAnalysis === 'object' && !Array.isArray(parsedAnalysis)) {
      // NEW FORMAT: Full analysis object
      console.log('? Using NEW format (full analysis object)');
      analysis = {
        attendance: parsedAnalysis.attendance || { present: meeting.participants || [], absent: [] },
        personalProgress: parsedAnalysis.personalProgress || [],
        workload: parsedAnalysis.workload || [],
        actionItems: parsedAnalysis.actionItems || meeting.actionItems || [],
        keyDecisions: parsedAnalysis.keyDecisions || meeting.keyDecisions || [],
        summary: parsedAnalysis.summary || { blockersToFollowUp: [], priorityTasks: [], responsibilities: [] },
        participants: parsedAnalysis.participants || meeting.participants || [],
      };
      
      // Ensure summary has correct structure
      if (Array.isArray(analysis.summary)) {
        analysis.summary = {
          blockersToFollowUp: [],
          priorityTasks: analysis.summary,
          responsibilities: []
        };
      } else if (!analysis.summary.blockersToFollowUp) {
        analysis.summary = {
          blockersToFollowUp: analysis.summary.blockersToFollowUp || [],
          priorityTasks: analysis.summary.priorityTasks || [],
          responsibilities: analysis.summary.responsibilities || []
        };
      }
    } else {
      // OLD FORMAT: Separate fields
      console.log('?? Using OLD format (separate fields)');
      analysis = {
        attendance: { present: meeting.participants || [], absent: [] },
        personalProgress: [],
        workload: [],
        actionItems: meeting.actionItems || [],
        keyDecisions: meeting.keyDecisions || [],
        summary: {
          blockersToFollowUp: [],
          priorityTasks: Array.isArray(meeting.summary) ? meeting.summary : [],
          responsibilities: []
        },
        participants: meeting.participants || [],
      };
    }

    // Return in MeetingResult format
    const result = {
      id: meeting.id,
      transcript,
      analysis,
      metadata: {
        fileName: meeting.fileName || 'Recording',
        fileSize: meeting.fileSize || 0,
        processedAt: meeting.createdAt.toISOString(),
        estimatedCost: meeting.estimatedCost,
      },
      title: meeting.title,
      meetingDate: meeting.meetingDate,
      source: meeting.source,
    };

    console.log('?? Sending to client:', JSON.stringify(result, null, 2));

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meeting' },
      { status: 500, headers: corsHeaders }
    );
  }
}

