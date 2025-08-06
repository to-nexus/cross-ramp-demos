'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  // Additional languages can be easily added here
  // { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'en' | 'zh' | 'zh-Hant' | 'ko');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-white font-medium transition-all duration-200 min-w-[80px] sm:min-w-[120px] justify-between"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-sm sm:text-sm">{currentLanguage?.flag}</span>
          <span className="text-sm sm:text-sm">{currentLanguage?.name}</span>
        </div>
        <svg 
          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl min-w-[80px] sm:min-w-[120px] z-[9999]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-sm transition-colors duration-150 ${
                language === lang.code
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 