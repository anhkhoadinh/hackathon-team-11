'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import MeetingHistoryHeader from '@/components/MeetingHistoryHeader';
import MeetingFilters from '@/components/MeetingFilters';
import MeetingCard from '@/components/MeetingCard';

interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  duration: number;
  summary: string[];
  actionItems: Array<{ task: string; assignee: string }>;
  keyDecisions: string[];
  participants: string[];
  source: string;
  fileName: string | null;
  estimatedCost: number;
  createdAt: string;
}

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('meetingDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, [startDate, endDate, sourceFilter, sortBy, sortOrder]);

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(sourceFilter !== 'all' && { source: sourceFilter }),
      });

      const response = await fetch(`/api/meetings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      setMeetings(data.meetings);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      meeting.title.toLowerCase().includes(query) ||
      meeting.participants.some(p => p.toLowerCase().includes(query)) ||
      meeting.summary.some(s => s.toLowerCase().includes(query))
    );
  });

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSourceFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25C9D0]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <MeetingHistoryHeader totalMeetings={filteredMeetings.length} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="space-y-6">
          <MeetingFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            onClearFilters={handleClearFilters}
          />

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#25C9D0] animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Loading meetings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="glass border-red-200 rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Meetings</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <button
                onClick={fetchMeetings}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
              >
                Retry
              </button>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="glass border-[#25C9D0]/20 rounded-xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-[#25C9D0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-[#25C9D0]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No meetings found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                {searchQuery || startDate || endDate || sourceFilter !== 'all'
                  ? 'Try adjusting your filters to find more meetings'
                  : 'Start by uploading a recording or using the Chrome extension to record your first meeting'}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white rounded-lg hover:shadow-lg hover:shadow-[#25C9D0]/30 transition-all font-semibold"
              >
                Record Your First Meeting
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">
                  Showing <span className="font-bold text-[#25C9D0]">{filteredMeetings.length}</span> meeting{filteredMeetings.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

