import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CORS headers for Chrome Extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/meetings - Save a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      meetingDate,
      duration,
      transcript,
      analysis,
      source,
      fileName,
      fileSize,
      estimatedCost,
    } = body;

    // Validate required fields
    if (!transcript || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields: transcript and analysis' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create meeting record
    const meeting = await prisma.meeting.create({
      data: {
        title: title || `Meeting on ${new Date().toLocaleDateString()}`,
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
        duration: duration || 0,
        transcript: JSON.stringify(transcript),
        summary: JSON.stringify(analysis), // Store FULL analysis object
        actionItems: analysis.actionItems || [],
        keyDecisions: analysis.keyDecisions || [],
        participants: analysis.participants || [],
        source: source || 'upload',
        fileName: fileName || null,
        fileSize: fileSize || null,
        estimatedCost: estimatedCost || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        meetingId: meeting.id,
        message: 'Meeting saved successfully',
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving meeting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save meeting' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET /api/meetings - Get all meetings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const source = searchParams.get('source');
    const sortBy = searchParams.get('sortBy') || 'meetingDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    
    if (startDate || endDate) {
      where.meetingDate = {};
      if (startDate) where.meetingDate.gte = new Date(startDate);
      if (endDate) where.meetingDate.lte = new Date(endDate);
    }
    
    if (source) {
      where.source = source;
    }

    // Query meetings
    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          meetingDate: true,
          duration: true,
          summary: true,
          actionItems: true,
          keyDecisions: true,
          participants: true,
          source: true,
          fileName: true,
          estimatedCost: true,
          createdAt: true,
        },
      }),
      prisma.meeting.count({ where }),
    ]);

    return NextResponse.json(
      {
        meetings,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meetings' },
      { status: 500, headers: corsHeaders }
    );
  }
}

