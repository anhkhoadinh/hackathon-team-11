import { NextRequest, NextResponse } from 'next/server';
import { generateMeetingPDF } from '@/lib/pdf-generator';
import { MeetingResult } from '@/types';
import { convertToEnglishOnly } from '@/lib/utils';

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

    // Get language from request body if provided (optional)
    // This allows caller to specify language to skip translation if already English
    const language = (body as any).language as string | undefined;

    // Convert all content to English-only format
    // Analysis will be translated to English using GPT-4 (only if not already English)
    // Transcript will be sanitized to ASCII-safe format
    // This ensures PDF generation never fails due to font encoding issues
    // This is a deliberate design choice - PDFs are always in English
    const englishOnlyData = await convertToEnglishOnly(body, language);

    // Generate PDF with English-only data
    const pdf = generateMeetingPDF(englishOnlyData);
    
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

