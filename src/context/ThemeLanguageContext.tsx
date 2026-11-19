// src/context/ThemeLanguageContext.tsx
// ATROQ Education - Theme (Light / Dark) & Multi-Language (AZ, EN, RU) Context

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, TRANSLATIONS, getStoredLanguage, saveStoredLanguage } from '../lib/i18n';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'atroq_theme';

interface ThemeLanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextValue | null>(null);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    saveStoredLanguage(newLang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.az;

  // 2. Theme state (Default: 'light')
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Sync theme with DOM document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeLanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export function useThemeLanguage(): ThemeLanguageContextValue {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
}
