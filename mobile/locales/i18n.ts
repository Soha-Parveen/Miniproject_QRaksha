import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import kn from './kn.json';
import ml from './ml.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  ml: { translation: ml },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language is English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export const changeAppLanguage = async (lang: 'en' | 'hi' | 'kn' | 'ml') => {
  await i18n.changeLanguage(lang);
};

export default i18n;
