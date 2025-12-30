'use client';

import Link from 'next/link';
import { Sparkles, History, Plus } from 'lucide-react';

interface MeetingHistoryHeaderProps {
  totalMeetings?: number;
}

export default function MeetingHistoryHeader({ totalMeetings }: MeetingHistoryHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-[#25C9D0]/10 shadow-lg backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] rounded-[16px] blur-lg opacity-60"></div>
              <div className="relative flex items-center justify-center w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] text-white shadow-xl shadow-[#25C9D0]/30">
                <History className="h-7 w-7" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                Meeting History
                {totalMeetings !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#25C9D0]/10 text-[#25C9D0] border border-[#25C9D0]/20">
                    {totalMeetings}
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-600 hidden sm:block mt-0.5 font-medium">
                View and manage all your recorded meetings
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white hover:shadow-lg hover:shadow-[#25C9D0]/30 text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              New Meeting
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

