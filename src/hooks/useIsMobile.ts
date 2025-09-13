import { useEffect, useState } from "react";

// Hook to detect if viewport is under Tailwind's `sm` breakpoint (<640px)
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const legacyHandler: (
      this: MediaQueryList,
      ev: MediaQueryListEvent
    ) => void = () => {
      setIsMobile(mql.matches);
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    // Fallback for older browsers (Safari < 14)
    type LegacyMql = MediaQueryList & {
      addListener?: (
        listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
      ) => void;
      removeListener?: (
        listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
      ) => void;
    };
    const legacy = mql as LegacyMql;
    if (typeof legacy.addListener === "function") {
      legacy.addListener(legacyHandler);
      return () =>
        legacy.removeListener && legacy.removeListener(legacyHandler);
    }
    return;
  }, []);

  return isMobile;
}
