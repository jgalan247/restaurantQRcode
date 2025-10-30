import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from './locales/en/translation.json'
import frTranslation from './locales/fr/translation.json'
import enMenuItems from './locales/en/menu-items.json'
import frMenuItems from './locales/fr/menu-items.json'

const resources = {
  en: {
    translation: enTranslation,
    menuItems: enMenuItems
  },
  fr: {
    translation: frTranslation,
    menuItems: frMenuItems
  }
}

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
