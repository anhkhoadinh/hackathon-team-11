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
  doc.text('Daily Meeting Analysis Report', 20, yPosition);
  
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

  const analysis = result.analysis;

  // 1. Attendance Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Opening & Attendance', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const attendance = analysis.attendance || { present: [], absent: [] };
  
  doc.setFont('helvetica', 'bold');
  doc.text('Present:', 20, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  if (attendance.present.length > 0) {
    doc.text(attendance.present.join(', '), 25, yPosition);
    yPosition += 8;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No information', 25, yPosition);
    yPosition += 8;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Absent:', 20, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  if (attendance.absent.length > 0) {
    attendance.absent.forEach((person) => {
      const text = person.reason ? `${person.name} (${person.reason})` : person.name;
      doc.text(text, 25, yPosition);
      yPosition += 6;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No one absent', 25, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // 2. Personal Progress Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Personal Progress Updates', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const personalProgress = analysis.personalProgress || [];
  if (personalProgress.length > 0) {
    personalProgress.forEach((progress) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${progress.member}:`, 20, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.text('Yesterday:', 25, yPosition);
      yPosition += 6;
      if (progress.yesterday.length > 0) {
        progress.yesterday.forEach((task) => {
          const lines = doc.splitTextToSize(`• ${task}`, 160);
          lines.forEach((line: string) => {
            doc.text(line, 30, yPosition);
            yPosition += 5;
          });
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No information', 30, yPosition);
        yPosition += 5;
      }

      doc.setFont('helvetica', 'normal');
      doc.text('Today:', 25, yPosition);
      yPosition += 6;
      if (progress.today.length > 0) {
        progress.today.forEach((task) => {
          const lines = doc.splitTextToSize(`• ${task}`, 160);
          lines.forEach((line: string) => {
            doc.text(line, 30, yPosition);
            yPosition += 5;
          });
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No information', 30, yPosition);
        yPosition += 5;
      }

      doc.text('Blockers:', 25, yPosition);
      yPosition += 6;
      if (progress.blockers.length > 0) {
        progress.blockers.forEach((blocker) => {
          const lines = doc.splitTextToSize(`• ${blocker}`, 160);
          lines.forEach((line: string) => {
            doc.text(line, 30, yPosition);
            yPosition += 5;
          });
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No blockers', 30, yPosition);
        yPosition += 5;
      }

      yPosition += 8;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No progress updates', 20, yPosition);
    yPosition += 10;
  }

  // 3. Workload Assessment Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Workload Assessment', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const workload = analysis.workload || [];
  if (workload.length > 0) {
    const workloadData = workload.map(item => [
      item.member,
      item.status === 'overloaded' ? 'Overloaded' : 
      item.status === 'normal' ? 'Normal' : 'Free'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Member', 'Status']],
      body: workloadData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No workload information', 20, yPosition);
    yPosition += 15;
  }

  // 4. Action Items Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('4. New Tasks & Task Reallocation', 20, yPosition);
  yPosition += 10;

  if (analysis.actionItems && analysis.actionItems.length > 0) {
    const tableData = analysis.actionItems.map(item => [
      item.task,
      item.assignee || 'Unassigned',
      item.dueDate || 'Not set',
      item.priority || 'Not specified'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Task', 'Assignee', 'Due Date', 'Priority']],
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

  // 5. Key Decisions Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Key Decisions', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  if (analysis.keyDecisions && analysis.keyDecisions.length > 0) {
    analysis.keyDecisions.forEach((decision, index) => {
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

  // 6. Summary & Next Steps Section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Summary & Next Steps', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const summary = analysis.summary || { blockersToFollowUp: [], priorityTasks: [], responsibilities: [] };

  // Blockers to Follow-up
  doc.setFont('helvetica', 'bold');
  doc.text('Blockers to Follow-up:', 20, yPosition);
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  if (summary.blockersToFollowUp.length > 0) {
    summary.blockersToFollowUp.forEach((blocker) => {
      const lines = doc.splitTextToSize(`• ${blocker}`, 170);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 6;
      });
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No blockers to follow-up', 25, yPosition);
    yPosition += 6;
  }

  yPosition += 8;

  // Priority Tasks
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Priority Tasks:', 20, yPosition);
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  if (summary.priorityTasks.length > 0) {
    summary.priorityTasks.forEach((task) => {
      const lines = doc.splitTextToSize(`• ${task}`, 170);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 6;
      });
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No priority tasks', 25, yPosition);
    yPosition += 6;
  }

  yPosition += 8;

  // Responsibilities
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Responsibilities:', 20, yPosition);
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  if (summary.responsibilities.length > 0) {
    summary.responsibilities.forEach((resp) => {
      const taskText = resp.deadline 
        ? `${resp.task} (Deadline: ${resp.deadline})`
        : resp.task;
      const lines = doc.splitTextToSize(`• ${resp.person}: ${taskText}`, 170);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 25, yPosition);
        yPosition += 6;
      });
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('No responsibilities recorded', 25, yPosition);
    yPosition += 6;
  }

  yPosition += 10;

  // Participants Section (legacy support)
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
  const participants = analysis.participants || attendance.present || [];
  if (participants.length > 0) {
    doc.text(participants.join(', '), 20, yPosition);
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
