import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../../public/locales/en/common.json";
import ar from "../../public/locales/ar/common.json";

const applyDocumentDirection = (lng: string) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: localStorage.getItem("hrms-lang") ?? "en",
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: { escapeValue: false },
});

applyDocumentDirection(i18n.language);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("hrms-lang", lng);
  applyDocumentDirection(lng);
});

export default i18n;
