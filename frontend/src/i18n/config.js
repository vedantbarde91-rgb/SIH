import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import as from './locales/as.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', live: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', live: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', live: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', live: true },
  // Additional scheduled languages in national architecture
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', live: false },
  { code: 'bodo', name: 'Bodo', nativeName: 'बड़ो', live: false },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', live: false },
  { code: 'kha', name: 'Khasi', nativeName: 'Khasi', live: false },
  { code: 'gar', name: 'Garo', nativeName: 'A·chik', live: false },
  { code: 'miz', name: 'Mizo', nativeName: 'Mizo ṭawng', live: false },
  { code: 'naga', name: 'Nagamese', nativeName: 'Nagamese', live: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', live: false }
];

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      as: { translation: as },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
