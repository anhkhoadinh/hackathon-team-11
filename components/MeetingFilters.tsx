'use client';

import { Filter, Search, X, ArrowUpDown } from 'lucide-react';

interface MeetingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  onClearFilters: () => void;
}

export default function MeetingFilters({
  searchQuery,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sourceFilter,
  onSourceFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: MeetingFiltersProps) {
  const hasActiveFilters = searchQuery || startDate || endDate || sourceFilter !== 'all';

  return (
    <div className="glass border-[#25C9D0]/20 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] flex items-center justify-center">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Filters & Search</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, participants, or content..."
              className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all bg-white"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all bg-white"
          />
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Source
          </label>
          <select
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all bg-white"
          >
            <option value="all">All Sources</option>
            <option value="upload">File Upload</option>
            <option value="extension">Extension</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-200">
        <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Sort by:
        </span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#25C9D0] focus:border-[#25C9D0] transition-all bg-white"
        >
          <option value="meetingDate">Meeting Date</option>
          <option value="createdAt">Created Date</option>
          <option value="duration">Duration</option>
          <option value="title">Title</option>
        </select>
        
        <button
          onClick={onSortOrderChange}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium hover:border-[#25C9D0] hover:text-[#25C9D0] transition-all bg-white"
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#25C9D0] hover:bg-[#25C9D0]/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

