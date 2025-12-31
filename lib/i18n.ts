import enTranslations from '@/locales/en.json';
import viTranslations from '@/locales/vi.json';
import jaTranslations from '@/locales/ja.json';

export type Locale = 'en' | 'vi' | 'ja';

const translations = {
  en: enTranslations,
  vi: viTranslations,
  ja: jaTranslations,
} as const;

/**
 * Get a nested translation value by key path
 * Example: t('header.appName') -> 'MeetingMind AI'
 */
export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  // Navigate through nested object
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found even in English
        }
      }
      break;
    }
  }

  // If value is still an object, return the key
  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters in the string
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Get the default locale from localStorage or browser
 */
export function getDefaultLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem('ui-locale') as Locale | null;
  if (stored && (stored === 'en' || stored === 'vi' || stored === 'ja')) {
    return stored;
  }

  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'vi' || browserLang === 'ja') {
    return browserLang;
  }

  return 'en';
}

/**
 * Save locale preference to localStorage
 */
export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ui-locale', locale);
}

