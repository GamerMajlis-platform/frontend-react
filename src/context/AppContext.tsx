import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Product {
  id: number;
  category: string;
  productName: string;
  seller: string;
  price: string;
  rate: string;
  reviews: string;
  imageUrl?: string;
}

export interface WishlistItem extends Product {
  dateAdded: string; // ISO string
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketplace: boolean;
    tournaments: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
    showGameActivity: boolean;
  };
  preferences: {
    language: string;
    theme: "dark" | "light" | "auto";
    currency: string;
  };
}

interface AppContextShape {
  wishlist: WishlistItem[];
  isInWishlist: (id: number) => boolean;
  addToWishlist: (item: Product) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: Product) => void;
  settings: UserSettings;
  updateSetting: (
    category: keyof UserSettings,
    key: string,
    value: string | boolean
  ) => void;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

const LS_WISHLIST = "gm_wishlist";
const LS_SETTINGS = "gm_settings";

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    marketplace: false,
    tournaments: true,
  },
  privacy: {
    profileVisibility: "public",
    showOnlineStatus: true,
    showGameActivity: true,
  },
  preferences: { language: "en", theme: "dark", currency: "USD" },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load from localStorage
  useEffect(() => {
    try {
      const w = localStorage.getItem(LS_WISHLIST);
      if (w) setWishlist(JSON.parse(w));
    } catch {
      // ignore localStorage errors
    }
    try {
      const s = localStorage.getItem(LS_SETTINGS);
      if (s) setSettings(JSON.parse(s));
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlist));
    } catch {
      // ignore persistence errors
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore persistence errors
    }
  }, [settings]);

  const isInWishlist = useCallback(
    (id: number) => wishlist.some((w) => w.id === id),
    [wishlist]
  );

  const addToWishlist = useCallback((item: Product) => {
    setWishlist((prev) =>
      prev.some((w) => w.id === item.id)
        ? prev
        : [{ ...item, dateAdded: new Date().toISOString() }, ...prev]
    );
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const toggleWishlist = useCallback((item: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.id === item.id);
      if (exists) return prev.filter((w) => w.id !== item.id);
      return [{ ...item, dateAdded: new Date().toISOString() }, ...prev];
    });
  }, []);

  const updateSetting: AppContextShape["updateSetting"] = useCallback(
    (category, key, value) => {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value as never,
        },
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      wishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      settings,
      updateSetting,
    }),
    [
      wishlist,
      settings,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      updateSetting,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
