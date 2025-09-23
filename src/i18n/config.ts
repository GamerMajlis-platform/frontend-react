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
    // Enable debug logs to show missing translation keys
    debug: true,
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
    ns: ["translation", "profile", "events", "tournaments"],

    // Backend load path (served from /public). Use BASE_URL to support subpath deployments.
    backend: {
      loadPath: `${
        import.meta.env.BASE_URL
      }locales/{{lng}}/{{ns}}.json?v=${Date.now()}&nocache=${Math.random()}`,
      // Avoid aggressive caching during development so edits reflect immediately
      requestOptions: {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
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
  console.log("✅ i18n: Translations loaded successfully");
  console.log("🌐 Current language:", i18n.language);
  console.log("📚 Loaded resources:", Object.keys(i18n.store.data));

  // Debug: Check if specific keys exist
  const postsKeys = i18n.t("posts", { returnObjects: true });
  console.log("🔍 Posts object:", postsKeys);
  const feedKeys = i18n.t("posts.feed", { returnObjects: true });
  console.log("🔍 Posts.feed object:", feedKeys);
  console.log("🔍 Direct key test - noPosts:", i18n.t("posts.feed.noPosts"));
  console.log(
    "🔍 Direct key test - noPostsDescription:",
    i18n.t("posts.feed.noPostsDescription")
  );

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

// Enhanced missing translation key handling
i18n.on("missingKey", (lngs, ns, key, fallbackValue) => {
  const languages = Array.isArray(lngs) ? lngs.join(", ") : lngs;
  const namespace = ns || "translation";
  const keyPath = `${namespace}:${key}`;

  console.warn(`⚠️  [i18n] Missing translation key: ${keyPath}`);
  console.warn(`🌐 Languages: ${languages}`);
  console.warn(`📝 Fallback value: "${fallbackValue || key}"`);
  console.warn(`🔍 Check translation files: public/locales/*/translation.json`);

  // In development, also log the full context
  if (import.meta.env.DEV) {
    console.group(`🔧 [i18n DEBUG] Missing Key Details`);
    console.log(`Key: ${key}`);
    console.log(`Namespace: ${namespace}`);
    console.log(`Languages checked: ${languages}`);
    console.log(`Current language: ${i18n.language}`);
    console.log(`Fallback language: ${i18n.options.fallbackLng}`);
    console.groupEnd();
  }
});

export default i18n;
