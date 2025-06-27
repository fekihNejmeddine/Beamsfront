import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import des fichiers de traduction
import translationFR from "../locales/fr/translation.json";
import translationAR from "../locales/ar/translation.json";
import translationEN from "../locales/en/translation.json";

// Définir les ressources de traduction
const resources = {
  fr: { translation: translationFR },
  ar: { translation: translationAR },
  en: { translation: translationEN },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("I18N_LANGUAGE") || "fr",
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;