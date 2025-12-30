'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, Filter, Download, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

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
  const [sortOrder, setSortOrder] = useState('desc');
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
    
    // Check title
    if (meeting.title.toLowerCase().includes(query)) return true;
    
    // Check participants
    if (meeting.participants.some(p => p.toLowerCase().includes(query))) return true;
    
    // Check summary - handle both array and object formats
    if (meeting.summary) {
      if (Array.isArray(meeting.summary)) {
        // Old format: array of strings
        if (meeting.summary.some(s => s.toLowerCase().includes(query))) return true;
      } else if (typeof meeting.summary === 'object') {
        // New format: analysis object
        const summaryStr = JSON.stringify(meeting.summary).toLowerCase();
        if (summaryStr.includes(query)) return true;
      }
    }
    
    return false;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting History</h1>
              <p className="text-gray-600 mt-1">View and manage all your recorded meetings</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              New Meeting
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, participants, or content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="upload">File Upload</option>
                <option value="extension">Extension</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="meetingDate">Meeting Date</option>
              <option value="createdAt">Created Date</option>
              <option value="duration">Duration</option>
              <option value="title">Title</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>

            {(startDate || endDate || sourceFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSourceFilter('all');
                  setSearchQuery('');
                }}
                className="ml-auto text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMeetings}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || startDate || endDate || sourceFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by uploading a recording or using the Chrome extension'}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Record Your First Meeting
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/history/${meeting.id}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          meeting.source === 'extension'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {meeting.source === 'extension' ? 'Extension' : 'Upload'}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(meeting.meetingDate)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatDuration(meeting.duration)}
                        </div>
                        {meeting.participants.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Summary:</span>
                          <span className="text-gray-600 ml-2">{meeting.summary.length} points</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Action Items:</span>
                          <span className="text-gray-600 ml-2">{meeting.actionItems.length} tasks</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Key Decisions:</span>
                          <span className="text-gray-600 ml-2">{meeting.keyDecisions.length} decisions</span>
                        </div>
                      </div>
                    </div>

                    <ChevronDown className="w-5 h-5 text-gray-400 transform -rotate-90" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
