
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de', 'zh'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
  });

export default i18n;
