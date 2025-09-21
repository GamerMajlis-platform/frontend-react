import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthService, type User } from "../services/AuthService";
import { useLocalStorage } from "../hooks";

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
  preferences: { language: "en", currency: "USD" },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useLocalStorage<WishlistItem[]>(
    "wishlist",
    []
  );
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    "settings",
    defaultSettings
  );

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load from localStorage
  useEffect(() => {
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

  // Wishlist functions
  const isInWishlist = useCallback(
    (id: number) => wishlist.some((w: WishlistItem) => w.id === id),
    [wishlist]
  );

  const addToWishlist = useCallback(
    (item: Product) => {
      setWishlist((prev: WishlistItem[]) =>
        prev.some((w: WishlistItem) => w.id === item.id)
          ? prev
          : [{ ...item, dateAdded: new Date().toISOString() }, ...prev]
      );
    },
    [setWishlist]
  );

  const removeFromWishlist = useCallback(
    (id: number) => {
      setWishlist((prev: WishlistItem[]) =>
        prev.filter((w: WishlistItem) => w.id !== id)
      );
    },
    [setWishlist]
  );

  const toggleWishlist = useCallback(
    (item: Product) => {
      setWishlist((prev: WishlistItem[]) => {
        const exists = prev.some((w: WishlistItem) => w.id === item.id);
        if (exists) return prev.filter((w: WishlistItem) => w.id !== item.id);
        return [{ ...item, dateAdded: new Date().toISOString() }, ...prev];
      });
    },
    [setWishlist]
  );

  const updateSetting: AppContextShape["updateSetting"] = useCallback(
    (category, key, value) => {
      setSettings((prev: UserSettings) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value as never,
        },
      }));
    },
    [setSettings]
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
