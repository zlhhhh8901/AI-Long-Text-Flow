import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import en from './en';
import zh from './zh';

interface TranslationContextType {
  language: Language;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ai-flow-config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        return config.language || 'en';
      } catch {
        return 'en';
      }
    }
    return 'en';
  });

  // Listen for config changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('ai-flow-config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config.language && config.language !== language) {
            setLanguage(config.language);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for same-window updates
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [language]);

  const translations = language === 'zh' ? zh : en;

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ language, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};
