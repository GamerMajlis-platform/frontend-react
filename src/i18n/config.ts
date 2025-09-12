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

// Only persist language when it changes at runtime — don't overwrite
// an existing stored preference during i18n init (that can clobber a
// user's chosen language before detectors or preferences are applied).
i18n.on("languageChanged", (lng) => {
  try {
    if (typeof window !== "undefined" && lng) {
      localStorage.setItem("i18nextLng", lng);
    }
  } catch {
    /* ignore storage errors */
  }
  applyHtmlAttributes(lng);
});

// After i18n finishes initialization, check app settings in localStorage for
// an explicit saved language preference and apply it if different. This
// ensures the app-level preferences (saved by AppContext) win on refresh.
i18n.on("initialized", () => {
  try {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("gm_settings");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const saved = parsed?.preferences?.language;
    if (saved && typeof saved === "string" && saved !== i18n.language) {
      i18n.changeLanguage(saved).catch(() => {});
    }
  } catch {
    // ignore parse/storage errors
  }
});

// Surface missing translation keys in dev to ensure mapping correctness
if (import.meta.env.DEV) {
  i18n.on("missingKey", (_lngs, ns, key) => {
    console.warn(`[i18n] Missing key: ${ns}:${key}`);
  });

  // Centralized translation debug (prints once per language)
  const _loggedLangs = new Set<string>();
  const _debugKeys = [
    "labels.organizer",
    "labels.startDate",
    "labels.prizePool",
    "labels.playersJoined",
    "activity.join",
    "activity.watch",
    "activity.view",
    "activity.viewResults",
  ];

  const _getNS = () =>
    Array.isArray(i18n.options.defaultNS)
      ? i18n.options.defaultNS[0]
      : (i18n.options.defaultNS as string) || "translation";

  function _debugLogFor(lang?: string) {
    const language = (lang || i18n.language) as string;
    if (_loggedLangs.has(language)) return;
    _loggedLangs.add(language);
    const ns = _getNS();

    // Ensure the namespace is loaded before calling i18n.t to avoid
    // "access t before namespace loaded" warnings from i18next.
    // loadNamespaces returns a Promise; we run the debug after it resolves.
    i18n
      .loadNamespaces(ns)
      .then(() => {
        console.group(`i18n translation debug: ${language}`);
        _debugKeys.forEach((key) => {
          try {
            const raw = i18n.getResource(language, ns, key);
            if (raw !== undefined && raw !== null) {
              console.log(key + ":", i18n.t(key, { lng: language }));
            } else {
              console.warn(`${key} is missing in '${language}' -> raw:`, raw);
            }
          } catch (e) {
            console.error("i18n debug error for key", key, e);
          }
        });
        console.groupEnd();
      })
      .catch((err) => {
        console.error("i18n: failed to load namespace for debug", ns, err);
      });
  }

  // Run once on init and whenever the language changes
  i18n.on("initialized", () => _debugLogFor());
  i18n.on("languageChanged", (lng) => _debugLogFor(lng));
}

export default i18n;
