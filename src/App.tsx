import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AppProvider } from "./context/AppContext";
import "./App.css";

// Components
import { Header, Footer } from "./components";
const ChatBot = lazy(() => import("./components/ChatBot"));

// Pages
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
const Events = lazy(() => import("./pages/Events"));
const Messages = lazy(() => import("./pages/Messages"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Settings = lazy(() => import("./pages/Settings"));
import { PreferencesBootstrap } from "./components";

type PageType =
  | "home"
  | "profile"
  | "tournaments"
  | "events"
  | "messages"
  | "marketplace"
  | "signup"
  | "login"
  | "wishlist"
  | "settings";

function App() {
  const { i18n } = useTranslation();
  const resolvePageFromHash = (): PageType => {
    const hash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
    switch (hash) {
      case "signup":
        return "signup";
      case "login":
        return "login";
      case "profile":
        return "profile";
      case "tournaments":
        return "tournaments";
      case "events":
        return "events";
      case "messages":
        return "messages";
      case "marketplace":
        return "marketplace";
      case "wishlist":
        return "wishlist";
      case "settings":
        return "settings";
      default:
        return "home";
    }
  };

  const [currentPage, setCurrentPage] = useState<PageType>(
    resolvePageFromHash()
  );

  // No forced navigation on mount. keep the URL as-is so refresh preserves
  // the page the user is currently on. resolvePageFromHash() already picks
  // the appropriate initial page.

  // Keep the app responsive to hash changes so simple SPA navigation works
  useState(() => {
    const handler = () => setCurrentPage(resolvePageFromHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  });

  // Keep the URL hash in sync when navigation happens inside the app so
  // refreshing the page preserves the current view.
  useEffect(() => {
    try {
      const currentHash = (window.location.hash || "").replace(/^#/, "");
      if (currentHash !== currentPage) {
        window.location.hash = `#${currentPage}`;
      }
    } catch {
      // ignore cross-origin/frame errors
    }
  }, [currentPage]);

  // i18n readiness: load default namespace once, but keep hooks order stable
  const [i18nReady, setI18nReady] = useState(false);
  useEffect(() => {
    const ns = Array.isArray(i18n.options.defaultNS)
      ? i18n.options.defaultNS[0]
      : (i18n.options.defaultNS as string) || "translation";
    i18n
      .loadNamespaces(ns)
      .then(() => setI18nReady(true))
      .catch(() => setI18nReady(true));
  }, [i18n]);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={(page) => setCurrentPage(page as PageType)} />;
      case "profile":
        return <Profile />;
      case "tournaments":
        return <Tournaments />;
      case "events":
        return <Events />;
      case "messages":
        return <Messages />;
      case "marketplace":
        return <Marketplace />;
      case "signup":
        return <Signup />;
      case "login":
        return <Login />;
      case "wishlist":
        return <Wishlist />;
      case "settings":
        return <Settings />;
      default:
        return <Home onNavigate={(page) => setCurrentPage(page as PageType)} />;
    }
  };

  const isAuthPage = currentPage === "signup" || currentPage === "login";

  return (
    <AppProvider>
      <PreferencesBootstrap />
      <div className="w-full min-h-screen bg-slate-900 flex flex-col">
        {!isAuthPage && (
          <Header
            activeSection={currentPage}
            onSectionChange={(section) => setCurrentPage(section as PageType)}
          />
        )}

        <div className="flex-1">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-white/70">
                Loading...
              </div>
            }
          >
            {!i18nReady ? (
              <div className="w-full h-full flex items-center justify-center text-white/70">
                Loading translations...
              </div>
            ) : (
              renderPage()
            )}
          </Suspense>
        </div>

        {!isAuthPage && <Footer />}

        {/* Global ChatBot - appears on all pages */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </div>
    </AppProvider>
  );
}

export default App;
