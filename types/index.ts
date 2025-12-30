export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface ActionItem {
  task: string;
  assignee: string;
  dueDate: string | null;
}

export interface MeetingAnalysis {
  summary: string[];
  actionItems: ActionItem[];
  keyDecisions: string[];
  participants: string[];
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

export interface MeetingResult {
  transcript: {
    text: string;
    segments: TranscriptSegment[];
    duration: number;
  };
  analysis: MeetingAnalysis;
  metadata: {
    fileName: string;
    fileSize: number;
    processedAt: string;
    estimatedCost: number;
  };
}

