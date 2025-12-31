'use client';

import Link from 'next/link';
import { Sparkles, History } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import { useTranslation } from '@/contexts/TranslationContext';

interface HeaderProps {
  /** Icon to display in the logo area */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Subtitle/tagline text */
  subtitle?: string;
  /** Whether to show the history link */
  showHistoryLink?: boolean;
  /** Whether to show the new meeting link */
  showNewMeetingLink?: boolean;
}

export default function Header({
  icon,
  title,
  subtitle,
  showHistoryLink = false,
  showNewMeetingLink = false,
}: HeaderProps = {}) {
  const { t } = useTranslation();

  // Default icon and title if not provided
  const defaultIcon = icon || <Sparkles className="h-7 w-7" strokeWidth={2.5} />;
  const defaultTitle = title || t('header.appName');
  const defaultSubtitle = subtitle || t('header.tagline');

  return (
    <header className="sticky top-0 z-50 glass border-b border-[#25C9D0]/10 shadow-lg backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#25C9D0] to-[#14B8A6] text-white">
              {defaultIcon}
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                {defaultTitle}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#25C9D0]/10 text-[#25C9D0] border border-[#25C9D0]/20">
                  v2.0
                </span>
              </h1>
              <p className="text-sm text-slate-600 hidden sm:block mt-0.5 font-medium">
                {defaultSubtitle}
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <LanguageSwitcher />
            
            {showHistoryLink && (
              <Link
                href="/history"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25C9D0] text-white hover:bg-[#1BA1A8] text-sm font-semibold transition-all shadow-lg hover:shadow-xl shadow-[#25C9D0]/30"
              >
                <History className="w-4 h-4" />
                {t('header.history')}
              </Link>
            )}

            {showNewMeetingLink && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25C9D0] text-white hover:bg-[#1BA1A8] text-sm font-semibold transition-all shadow-lg hover:shadow-xl shadow-[#25C9D0]/30"
              >
                <Sparkles className="w-4 h-4" />
                {t('header.newMeeting')}
              </Link>
            )}

            {/* User Menu - Always visible */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

