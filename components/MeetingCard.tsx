'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, ChevronRight, FileText, ListTodo, Target } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  duration: number;
  summary: string[] | any; // Can be array (old) or object (new)
  actionItems: Array<{ task: string; assignee: string }>;
  keyDecisions: string[];
  participants: string[];
  source: string;
  fileName: string | null;
  estimatedCost: number;
  createdAt: string;
}

interface MeetingCardProps {
  meeting: Meeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle both old (array) and new (object) summary formats
  const getSummaryCount = () => {
    if (Array.isArray(meeting.summary)) {
      return meeting.summary.length;
    } else if (typeof meeting.summary === 'object' && meeting.summary !== null) {
      // New format: count priority tasks
      return meeting.summary.priorityTasks?.length || 0;
    }
    return 0;
  };

  return (
    <Link
      href={`/history/${meeting.id}`}
      className="block glass border-[#25C9D0]/20 rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-300 card-hover group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#25C9D0] transition-colors truncate">
                {meeting.title}
              </h3>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border-2 ${
                meeting.source === 'extension'
                  ? 'bg-[#14B8A6]/10 text-[#0F9488] border-[#14B8A6]/20'
                  : 'bg-[#25C9D0]/10 text-[#25C9D0] border-[#25C9D0]/20'
              }`}>
                {meeting.source === 'extension' ? 'Extension' : 'Upload'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#25C9D0]" />
                <span>{formatDate(meeting.meetingDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#25C9D0]" />
                <span>{formatDuration(meeting.duration)}</span>
              </div>
              {meeting.participants.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#25C9D0]" />
                  <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-[#25C9D0]/5 rounded-[10px] border border-[#25C9D0]/10">
                <FileText className="w-4 h-4 text-[#25C9D0]" />
                <div>
                  <div className="text-xs text-slate-500">Summary</div>
                  <div className="text-sm font-bold text-slate-900">{getSummaryCount()} points</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#14B8A6]/5 rounded-[10px] border border-[#14B8A6]/10">
                <ListTodo className="w-4 h-4 text-[#14B8A6]" />
                <div>
                  <div className="text-xs text-slate-500">Tasks</div>
                  <div className="text-sm font-bold text-slate-900">{meeting.actionItems.length} items</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#25C9D0]/5 rounded-[10px] border border-[#25C9D0]/10">
                <Target className="w-4 h-4 text-[#25C9D0]" />
                <div>
                  <div className="text-xs text-slate-500">Decisions</div>
                  <div className="text-sm font-bold text-slate-900">{meeting.keyDecisions.length} decisions</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-[#25C9D0]/30">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

