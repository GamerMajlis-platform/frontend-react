import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import "./App.css";

// Components
import { Header, Footer, ChatBot } from "./components";

// Pages
import {
  Home,
  Profile,
  Tournaments,
  Events,
  Messages,
  Marketplace,
  Signup,
  Login,
  Wishlist,
  Settings,
} from "./pages";
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
  const [currentPage, setCurrentPage] = useState<PageType>("home");

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

        <div className="flex-1">{renderPage()}</div>

        {!isAuthPage && <Footer />}

        {/* Global ChatBot - appears on all pages */}
        <ChatBot />
      </div>
    </AppProvider>
  );
}

export default App;
