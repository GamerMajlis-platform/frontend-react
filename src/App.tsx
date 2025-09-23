import { useState, useEffect, lazy } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppProvider } from "./context/AppContext";
import { useAppContext } from "./context/useAppContext";
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
const Chat = lazy(() => import("./pages/Chat"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const DiscordCallback = lazy(() => import("./pages/DiscordCallback"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Settings = lazy(() => import("./pages/Settings"));
const AuthSuccess = lazy(() => import("./pages/AuthSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { PreferencesBootstrap } from "./components";

// Page type retained only for active nav tracking
type PageType =
  | "home"
  | "profile"
  | "tournaments"
  | "events"
  | "messages"
  | "chat"
  | "marketplace"
  | "signup"
  | "login"
  | "verify-email"
  | "discord-callback"
  | "auth-success"
  | "wishlist"
  | "settings";

function AppContent() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive current page from pathname for active nav styling
  const path = location.pathname.replace(/\/$/, "");
  const segment = path.split("/")[1] || ""; // first segment
  const currentPage: PageType = ((): PageType => {
    switch (segment) {
      case "profile":
        return "profile";
      case "tournaments":
        return "tournaments";
      case "events":
        return "events";
      case "messages":
        return "messages";
      case "chat":
        return "chat";
      case "marketplace":
        return "marketplace";
      case "signup":
        return "signup";
      case "login":
        return "login";
      case "verify-email":
        return "verify-email";
      case "discord-callback":
        return "discord-callback";
      case "auth":
        if (path.startsWith("/auth/success")) return "auth-success";
        return "home";
      case "wishlist":
        return "wishlist";
      case "settings":
        return "settings";
      default:
        return "home";
    }
  })();

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

  const handleNavChange = (section: string) => {
    // Support dynamic profile/id pattern
    if (section.startsWith("profile/")) {
      navigate(`/${section}`);
      return;
    }
    switch (section) {
      case "home":
        navigate("/");
        break;
      case "profile":
        navigate("/profile");
        break;
      case "tournaments":
      case "events":
      case "messages":
      case "chat":
      case "marketplace":
      case "signup":
      case "login":
      case "verify-email":
      case "discord-callback":
      case "wishlist":
      case "settings":
        navigate(`/${section}`);
        break;
      default:
        navigate("/");
    }
  };

  const isAuthPage =
    currentPage === "signup" ||
    currentPage === "login" ||
    currentPage === "verify-email";

  // Ensure no guest access - all pages require authentication except auth pages and home
  const requiresAuth = !isAuthPage && currentPage !== "home";

  // Redirect unauthorized users trying to access protected pages
  useEffect(() => {
    if (requiresAuth && !isAuthenticated && i18nReady) {
      console.log("🚫 Unauthorized access attempt, redirecting to home");
      navigate("/");
    }
  }, [requiresAuth, isAuthenticated, i18nReady, navigate]);

  return (
    <>
      <PreferencesBootstrap />
      <div className="w-full min-h-screen bg-slate-900 flex flex-col">
        {!isAuthPage && !(currentPage === "home" && !isAuthenticated) && (
          <ErrorBoundary
            fallback={
              <div className="h-16 bg-slate-800 text-white text-center p-4">
                Header error
              </div>
            }
          >
            <Header
              activeSection={currentPage}
              onSectionChange={handleNavChange}
            />
          </ErrorBoundary>
        )}

        <div className="flex-1">
          <ErrorBoundary>
            <MultipleSuspense level="page">
              {!i18nReady ? (
                <DefaultLoader />
              ) : (
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/tournaments" element={<Tournaments />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route
                    path="/discord-callback"
                    element={<DiscordCallback />}
                  />
                  {/* Backend may redirect to /auth/discord/callback (see backend docs) */}
                  <Route
                    path="/auth/discord/callback"
                    element={<DiscordCallback />}
                  />
                  <Route path="/auth/success" element={<AuthSuccess />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
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
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
