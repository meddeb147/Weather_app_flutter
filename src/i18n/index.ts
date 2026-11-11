import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { Language } from '@/data/types';

import ar from './locales/ar';
import en from './locales/en';
import fr from './locales/fr';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'fr' || code === 'ar' ? code : 'en';
}

export function isRTL(language: string): boolean {
  return language === 'ar';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar } },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
