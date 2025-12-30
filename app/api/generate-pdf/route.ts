import { NextRequest, NextResponse } from 'next/server';
import { generateMeetingPDF } from '@/lib/pdf-generator';
import { MeetingResult } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body: MeetingResult = await request.json();

    // Validate input
    if (!body.transcript || !body.analysis || !body.metadata) {
      return NextResponse.json(
        { error: 'Invalid meeting data provided' },
        { status: 400 }
      );
    }

    console.log('Generating PDF for:', body.metadata.fileName);

    // Generate PDF
    const pdf = generateMeetingPDF(body);
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `meeting-transcript-${timestamp}.pdf`;

    console.log(`PDF generated: ${filename} (${(pdfBuffer.length / 1024).toFixed(2)}KB)`);

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

