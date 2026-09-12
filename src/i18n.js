import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importamos los diccionarios
import esTranslation from './locales/es.json';
import enTranslation from './locales/en.json';
import frTranslation from './locales/fr.json';

const resources = {
  es: { translation: esTranslation },
  en: { translation: enTranslation },
  fr: { translation: frTranslation }
};

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa la instancia a react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Si falla o no encuentra un idioma, usa español
    debug: false, // Ponlo en true si quieres ver logs en la consola durante el desarrollo
    
    interpolation: {
      escapeValue: false, // React ya protege contra inyecciones XSS (Cross-Site Scripting)
    }
  });

// Sincronizar dinámicamente el atributo lang en <html> para lectores de pantalla y accesibilidad (WCAG 3.1.1 / 3.1.2)
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language ? i18n.language.substring(0, 2) : 'es';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng ? lng.substring(0, 2) : 'es';
  });
}

export default i18n;