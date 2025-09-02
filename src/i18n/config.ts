import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  // Load translations from public/locales via HTTP (lazy)
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Language settings
    fallbackLng: "en",
    // Enable detailed logs only in development to help catch missing keys/loads
    debug: import.meta.env.DEV,
    supportedLngs: ["en", "ar"],
    load: "languageOnly", // normalize en-US -> en
    nonExplicitSupportedLngs: true,
    cleanCode: true,
    lowerCaseLng: true,

    // Detection settings (allow ?lang=ar to override)
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },

    // React i18next settings
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: true,
    },

    // Default namespace
    defaultNS: "translation",
    ns: ["translation"],

    // Backend load path (served from /public). Use BASE_URL to support subpath deployments.
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
      // Avoid aggressive caching during development so edits reflect immediately
      requestOptions: {
        cache: import.meta.env.DEV ? "no-store" : "default",
      },
    },
  });

// Keep document attributes in sync with the active language
const applyHtmlAttributes = (lng: string | undefined) => {
  if (typeof document === "undefined") return;
  const lang = lng || i18n.language || "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang.startsWith("ar") ? "rtl" : "ltr";
};

applyHtmlAttributes(i18n.resolvedLanguage);
i18n.on("languageChanged", (lng) => applyHtmlAttributes(lng));

// Surface missing translation keys in dev to ensure mapping correctness
if (import.meta.env.DEV) {
  i18n.on("missingKey", (_lngs, ns, key) => {
    console.warn(`[i18n] Missing key: ${ns}:${key}`);
  });
}

export default i18n;
