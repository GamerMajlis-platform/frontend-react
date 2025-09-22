import { useState, useEffect, lazy } from "react";
import { useTranslation } from "react-i18next";
import { AppProvider } from "./context/AppContext";
import "./App.css";

// Components
import { Header, Footer } from "./components";
import {
  ErrorBoundary,
  MultipleSuspense,
  DefaultLoader,
} from "./components/shared";
const ChatBot = lazy(() => import("./components/shared/ChatBot"));

// Pages
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
const Events = lazy(() => import("./pages/Events"));
const Messages = lazy(() => import("./pages/Messages"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const DiscordCallback = lazy(() => import("./pages/DiscordCallback"));
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
  | "verify-email"
  | "discord-callback"
  | "wishlist"
  | "settings";

function App() {
  const { i18n } = useTranslation();
  const resolvePageFromHash = (): PageType => {
    const hash = (window.location.hash || "").replace(/^#/, "").toLowerCase();
    // Check for verify-email with query parameters
    if (
      window.location.pathname === "/verify-email" ||
      hash === "verify-email"
    ) {
      return "verify-email";
    }
    // Check for Discord OAuth callback
    if (
      window.location.pathname === "/auth/discord/callback" ||
      hash === "discord-callback"
    ) {
      return "discord-callback";
    }
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
  useEffect(() => {
    const handler = () => setCurrentPage(resolvePageFromHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

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
      case "verify-email":
        return <EmailVerification />;
      case "discord-callback":
        return <DiscordCallback />;
      case "wishlist":
        return <Wishlist />;
      case "settings":
        return <Settings />;
      default:
        return <Home onNavigate={(page) => setCurrentPage(page as PageType)} />;
    }
  };

  const isAuthPage =
    currentPage === "signup" ||
    currentPage === "login" ||
    currentPage === "verify-email";

  return (
    <AppProvider>
      <PreferencesBootstrap />
      <div className="w-full min-h-screen bg-slate-900 flex flex-col">
        {!isAuthPage && (
          <ErrorBoundary
            fallback={
              <div className="h-16 bg-slate-800 text-white text-center p-4">
                Header error
              </div>
            }
          >
            <Header
              activeSection={currentPage}
              onSectionChange={(section) => setCurrentPage(section as PageType)}
            />
          </ErrorBoundary>
        )}

        <div className="flex-1">
          <ErrorBoundary>
            <MultipleSuspense level="page">
              {!i18nReady ? <DefaultLoader /> : renderPage()}
            </MultipleSuspense>
          </ErrorBoundary>
        </div>

        {!isAuthPage && (
          <ErrorBoundary
            fallback={
              <div className="h-16 bg-slate-800 text-white text-center p-4">
                Footer error
              </div>
            }
          >
            <Footer />
          </ErrorBoundary>
        )}

        {/* Global ChatBot - appears on all pages */}
        <ErrorBoundary fallback={null}>
          <MultipleSuspense level="component">
            <ChatBot />
          </MultipleSuspense>
        </ErrorBoundary>
      </div>
    </AppProvider>
  );
}

export default App;
