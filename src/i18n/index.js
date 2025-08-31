import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// import en from "./en.json";
import es from "./es.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: es,
      },
      //   en: {
      //     translation: en,
      //   },
    },
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
