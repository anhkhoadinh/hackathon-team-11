'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, FileText, Filter, Download, Search, ChevronDown, Sparkles, History } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import MeetingCard from '@/components/MeetingCard';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import { useTranslation } from '@/contexts/TranslationContext';

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

const PAGE_SIZE = 10; // Default limit per page

export default function HistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  
  // Get state from URL params or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const sourceFilter = searchParams.get('source') || 'all';
  const sortBy = searchParams.get('sortBy') || 'meetingDate';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const searchQuery = searchParams.get('search') || '';

  // Calculate offset from current page
  const offset = (currentPage - 1) * PAGE_SIZE;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Update URL params helper
  const updateURLParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    router.push(`/history?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Fetch meetings with pagination
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const currentOffset = (currentPage - 1) * PAGE_SIZE;
    
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        limit: PAGE_SIZE.toString(),
        offset: currentOffset.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(sourceFilter !== 'all' && { source: sourceFilter }),
      });

      const response = await fetch(`/api/meetings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      setMeetings(data.meetings || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, sourceFilter, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Handle page change
  const handlePageChange = (page: number) => {
    updateURLParams({ page: page.toString() });
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filter changes - reset to page 1
  const handleStartDateChange = (value: string) => {
    updateURLParams({ startDate: value, page: '1' });
  };

  const handleEndDateChange = (value: string) => {
    updateURLParams({ endDate: value, page: '1' });
  };

  const handleSourceFilterChange = (value: string) => {
    updateURLParams({ source: value === 'all' ? null : value, page: '1' });
  };

  const handleSortByChange = (value: string) => {
    updateURLParams({ sortBy: value, page: '1' });
  };

  const handleSortOrderChange = () => {
    updateURLParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' });
  };

  const handleSearchChange = (value: string) => {
    updateURLParams({ search: value || null, page: '1' });
  };

  const handleClearFilters = () => {
    updateURLParams({
      startDate: null,
      endDate: null,
      source: null,
      search: null,
      page: '1',
    });
  };

  // Apply client-side search filter (after pagination)
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

  // Calculate display count (accounting for search filter)
  const displayCount = searchQuery ? filteredMeetings.length : totalCount;
  const showingStart = totalCount > 0 && !searchQuery ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = searchQuery 
    ? filteredMeetings.length 
    : Math.min(currentPage * PAGE_SIZE, totalCount);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#25C9D0]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#14B8A6]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Modern Header */}
      <Header 
        icon={<History className="h-7 w-7" strokeWidth={2.5} />}
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        showNewMeetingLink={true}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="space-y-6">
          {/* Filters Panel */}
          <div className="glass border-[#25C9D0]/20 rounded-[16px] p-6 shadow-xl fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold gradient-text">{t('history.filters.title')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('history.filters.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('history.filters.searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-[10px] focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('history.filters.startDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-[10px] focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('history.filters.endDate')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-[10px] focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all"
                />
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('history.filters.source')}
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => handleSourceFilterChange(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-[10px] focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all"
                >
                  <option value="all">{t('history.filters.allSources')}</option>
                  <option value="upload">{t('history.filters.fileUpload')}</option>
                  <option value="extension">{t('history.filters.extension')}</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t-2 border-slate-200">
              <span className="text-sm font-semibold text-slate-700">{t('history.filters.sortBy')}</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="px-4 py-2 border-2 border-slate-200 rounded-[10px] text-sm focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all"
              >
                <option value="meetingDate">{t('history.filters.meetingDate')}</option>
                <option value="createdAt">{t('history.filters.createdDate')}</option>
                <option value="duration">{t('history.filters.duration')}</option>
                <option value="title">{t('history.filters.title')}</option>
              </select>
              
              <button
                onClick={handleSortOrderChange}
                className="px-4 py-2 border-2 border-slate-200 rounded-[10px] text-sm font-medium hover:bg-[#25C9D0]/10 hover:border-[#25C9D0]/50 transition-all"
              >
                {sortOrder === 'asc' ? t('common.ascending') : t('common.descending')}
              </button>

              {(startDate || endDate || sourceFilter !== 'all' || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-sm font-semibold text-[#25C9D0] hover:text-[#1BA1A8] transition-colors"
                >
                  {t('history.filters.clearFilters')}
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25C9D0]"></div>
            </div>
          ) : error ? (
            <div className="glass border-red-300/20 rounded-[16px] p-8 text-center shadow-xl">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={fetchMeetings}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all shadow-lg"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="glass border-[#25C9D0]/20 rounded-[16px] p-12 text-center shadow-xl fade-in-up">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#25C9D0]/10 to-[#14B8A6]/10 flex items-center justify-center">
                <FileText className="w-10 h-10 text-[#25C9D0]" />
              </div>
              <h3 className="text-xl font-bold gradient-text mb-3">{t('history.empty.title')}</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchQuery || startDate || endDate || sourceFilter !== 'all'
                  ? t('history.empty.message')
                  : t('history.empty.messageNoFilters')}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white rounded-lg hover:shadow-lg transition-all shadow-lg shadow-[#25C9D0]/30"
              >
                <Sparkles className="w-4 h-4" />
                {t('history.empty.cta')}
              </Link>
            </div>
          ) : (
            <div className="space-y-6 fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">
                  {searchQuery
                    ? t('history.showing', { 
                        count: filteredMeetings.length, 
                        plural: filteredMeetings.length !== 1 ? 's' : '' 
                      })
                    : totalCount > 0
                    ? `Showing ${showingStart}-${showingEnd} of ${totalCount} meeting${totalCount !== 1 ? 's' : ''}`
                    : t('history.showing', { count: 0, plural: '' })
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && !searchQuery && (
                <div className="mt-8 pt-6 border-t-2 border-slate-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
