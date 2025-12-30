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
  priority?: string;
  technicalNotes?: string;
}

export interface PersonalProgress {
  member: string;
  yesterday: string[];
  today: string[];
  blockers: string[];
}

export interface WorkloadStatus {
  member: string;
  status: 'overloaded' | 'normal' | 'free';
}

export interface Attendance {
  present: string[];
  absent: Array<{ name: string; reason?: string }>;
}

export interface MeetingAnalysis {
  // 1. Mở đầu & Điểm danh
  attendance: Attendance;
  
  // 2. Cập nhật tiến độ cá nhân
  personalProgress: PersonalProgress[];
  
  // 3. Đánh giá workload
  workload: WorkloadStatus[];
  
  // 4. Giao việc mới & điều chuyển công việc
  actionItems: ActionItem[];
  
  // 5. Chốt quyết định
  keyDecisions: string[];
  
  // 6. Tổng kết & bước tiếp theo
  summary: {
    blockersToFollowUp: string[];
    priorityTasks: string[];
    responsibilities: Array<{ person: string; task: string; deadline?: string }>;
  };
  
  // Legacy fields for backward compatibility
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
