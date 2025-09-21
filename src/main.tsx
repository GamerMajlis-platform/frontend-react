import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/config";
import App from "./App.tsx";
import { ErrorBoundary, PageLoader } from "./components/shared";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
