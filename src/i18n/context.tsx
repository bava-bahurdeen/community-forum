'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import enCatalog from './locales/en.json';
import esCatalog from './locales/es.json';

type Locale = 'en' | 'es';

type TranslationsCatalog = typeof enCatalog;

const catalogs: Record<Locale, TranslationsCatalog> = {
  en: enCatalog,
  es: esCatalog,
};

interface I18nContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof TranslationsCatalog | string, replacements?: Record<string, string | number>) => string;
  tPlural: (count: number) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load language preference from local storage
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale === 'en' || savedLocale === 'es') {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: keyof TranslationsCatalog | string, replacements?: Record<string, string | number>): string => {
    const catalog = catalogs[locale];
    const rawValue = (catalog as Record<string, string>)[key] || key;

    if (!replacements) return rawValue;

    let interpolated = rawValue;
    Object.entries(replacements).forEach(([token, value]) => {
      interpolated = interpolated.replace(`{${token}}`, String(value));
    });

    return interpolated;
  };

  // Pluralization helper for Saves Count
  const tPlural = (count: number): string => {
    if (count === 0) {
      return t('saved.count_zero');
    }
    if (count === 1) {
      return t('saved.count_one');
    }
    return t('saved.count_plural', { count });
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tPlural }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
