import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n/config';
import { Globe, Info } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const activeCode = (i18n.language || 'en').split('-')[0];
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === activeCode) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (lang) => {
    if (lang.live) {
      i18n.changeLanguage(lang.code);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition"
      >
        <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
        <span>{currentLang.nativeName}</span>
        <span className="text-[10px] text-slate-400 uppercase">({currentLang.code})</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden">
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Select Interface Language</p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                <Info className="w-3 h-3 flex-shrink-0" />
                <span>English, हिन्दी, मराठी Active</span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  disabled={!lang.live}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition ${
                    lang.code === activeCode
                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 font-bold'
                      : lang.live
                      ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      : 'opacity-40 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">({lang.name})</span>
                  </div>
                  {lang.live ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Live
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 py-0.2 text-slate-400 italic">
                      Scheduled
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
