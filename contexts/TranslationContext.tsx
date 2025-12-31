'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getDefaultLocale, saveLocale, getTranslation } from '@/lib/i18n';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    setMounted(true);
    const defaultLocale = getDefaultLocale();
    setLocaleState(defaultLocale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(locale, key, params);
  };

  // Always provide the context, but use default 'en' during SSR
  // This prevents the "must be used within a TranslationProvider" error
  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

