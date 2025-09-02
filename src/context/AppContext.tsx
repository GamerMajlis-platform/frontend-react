import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthService, type User } from "../services/AuthService";

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
  // Wishlist
  wishlist: WishlistItem[];
  isInWishlist: (id: number) => boolean;
  addToWishlist: (item: Product) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: Product) => void;

  // Settings
  settings: UserSettings;
  updateSetting: (
    category: keyof UserSettings,
    key: string,
    value: string | boolean
  ) => void;

  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

export { AppContext };

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

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

    // Initialize authentication state from localStorage
    try {
      const storedUser = AuthService.getStoredUser();
      const storedToken = AuthService.getStoredToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch {
      // ignore auth initialization errors
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

  // Wishlist functions
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

  // Authentication functions
  const login = useCallback(async (email: string, password: string) => {
    const { user: authUser } = await AuthService.login(email, password);
    setUser(authUser);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(
    async (displayName: string, email: string, password: string) => {
      const { user: authUser } = await AuthService.register(
        displayName,
        email,
        password
      );
      setUser(authUser);
      setIsAuthenticated(true);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.warn("Logout API call failed, but clearing local state:", error);
    } finally {
      // Always clear local state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      // Wishlist
      wishlist,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,

      // Settings
      settings,
      updateSetting,

      // Authentication
      user,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [
      wishlist,
      settings,
      user,
      isAuthenticated,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      updateSetting,
      login,
      register,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
