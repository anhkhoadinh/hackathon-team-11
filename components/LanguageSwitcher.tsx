'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Locale } from '@/lib/i18n';

const languages: Array<{ value: Locale; label: string; nativeLabel: string }> = [
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { value: 'ja', label: 'Japanese', nativeLabel: '日本語' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.value === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-[#25C9D0]/50 hover:bg-[#25C9D0]/5 transition-all duration-200 bg-white text-slate-700 font-medium text-sm"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 text-[#25C9D0]" />
        <span className="hidden sm:inline">{currentLanguage.value.toUpperCase()}</span>
        <span className="sm:hidden">{currentLanguage.value.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-[12px] border-2 border-slate-200 shadow-xl z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`w-full px-4 py-3 text-left hover:bg-[#25C9D0]/5 transition-colors flex items-center justify-between ${
                locale === lang.value ? 'bg-[#25C9D0]/10' : ''
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-600">{lang.nativeLabel}</span>
                <span className="text-xs text-slate-500">{lang.label}</span>
              </div>
              {locale === lang.value && (
                <Check className="h-4 w-4 text-[#25C9D0]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

