'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  // Don't render if only one page or no pages
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Show max 5 page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-1 px-4 py-2 rounded-[10px] border-2 transition-all
          font-medium text-sm
          ${
            currentPage === 1
              ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
              : 'border-slate-200 text-slate-700 hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5 hover:text-[#25C9D0]'
          }
        `}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers - Hidden on mobile, show on tablet+ */}
      <div className="hidden md:flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-slate-400"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`
                min-w-[40px] px-3 py-2 rounded-[8px] border-2 transition-all
                font-medium text-sm
                ${
                  isActive
                    ? 'bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white border-transparent shadow-md shadow-[#25C9D0]/30'
                    : 'border-slate-200 text-slate-700 hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5'
                }
              `}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Current Page Indicator - Mobile only */}
      <div className="md:hidden px-3 py-2 text-sm font-medium text-slate-600">
        {currentPage} / {totalPages}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-1 px-4 py-2 rounded-[10px] border-2 transition-all
          font-medium text-sm
          ${
            currentPage === totalPages
              ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
              : 'border-slate-200 text-slate-700 hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5 hover:text-[#25C9D0]'
          }
        `}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

