import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MeetingResult } from '@/types';
import { formatDuration, formatTimestamp } from './utils';

export function generateMeetingPDF(result: MeetingResult): jsPDF {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Meeting Transcript & Analysis', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`File: ${result.metadata.fileName}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Date: ${new Date(result.metadata.processedAt).toLocaleString()}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Duration: ${formatDuration(result.transcript.duration)}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Estimated Cost: $${result.metadata.estimatedCost.toFixed(2)}`, 20, yPosition);
  
  yPosition += 15;

  // Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  result.analysis.summary.forEach((point, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${point}`, 170);
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 2;
  });

  yPosition += 10;

  // Action Items Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Action Items', 20, yPosition);
  yPosition += 10;

  if (result.analysis.actionItems.length > 0) {
    const tableData = result.analysis.actionItems.map(item => [
      item.task,
      item.assignee || 'Unassigned',
      item.dueDate || 'Not set'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Task', 'Assignee', 'Due Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('No action items detected', 20, yPosition);
    yPosition += 15;
  }

  // Key Decisions Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Decisions', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (result.analysis.keyDecisions.length > 0) {
    result.analysis.keyDecisions.forEach((decision, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${decision}`, 170);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No key decisions detected', 20, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // Participants Section
  if (yPosition > 260) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Participants', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (result.analysis.participants.length > 0) {
    doc.text(result.analysis.participants.join(', '), 20, yPosition);
    yPosition += 15;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No participants detected', 20, yPosition);
    yPosition += 15;
  }

  // Full Transcript Section
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Full Transcript', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  result.transcript.segments.forEach((segment) => {
    const timestamp = `[${formatTimestamp(segment.start)}]`;
    const lines = doc.splitTextToSize(segment.text, 150);
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(timestamp, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    
    lines.forEach((line: string, index: number) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, index === 0 ? 45 : 20, yPosition);
      yPosition += 5;
    });
    
    yPosition += 3;
  });

  return doc;
}

