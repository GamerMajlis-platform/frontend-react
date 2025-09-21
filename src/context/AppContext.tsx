import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthService } from "../services/AuthService";
import { ProfileService } from "../services/ProfileService";
import { SessionService } from "../services/SessionService";
import type { User, UpdateProfileData } from "../types/auth";
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
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
  };
  preferences: {
    language: string;
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
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<string>; // Returns success message
  logout: () => Promise<void>;

  // Profile Management
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

export { AppContext };

const defaultSettings: UserSettings = {
  privacy: {
    profileVisibility: "public",
    showOnlineStatus: true,
  },
  preferences: { language: "en" },
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
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Initialize session management
  useEffect(() => {
    let cleanupExpiredHandler: (() => void) | null = null;
    let cleanupLogoutHandler: (() => void) | null = null;

    const initializeSession = async () => {
      console.log("🚀 Initializing session management...");

      try {
        const sessionValid = await SessionService.initializeSession();

        if (sessionValid) {
          // Load user data
          const storedUser = AuthService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
            console.log("✅ Session restored for user:", storedUser.email);
          }
        }
      } catch (error) {
        console.error("❌ Session initialization failed:", error);
      } finally {
        setSessionInitialized(true);
      }
    };

    // Set up session event handlers
    cleanupExpiredHandler = SessionService.onSessionExpired(() => {
      console.log("🔒 Session expired - logging out user");
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login or show notification
      window.location.href = "/login";
    });

    cleanupLogoutHandler = SessionService.onLogout(() => {
      console.log("👋 User logged out - clearing auth state");
      setUser(null);
      setIsAuthenticated(false);
    });

    initializeSession();

    // Cleanup on unmount
    return () => {
      if (cleanupExpiredHandler) cleanupExpiredHandler();
      if (cleanupLogoutHandler) cleanupLogoutHandler();
      SessionService.stopTokenRefreshTimer();
    };
  }, []);

  // Legacy: Load from localStorage (keeping for fallback)
  useEffect(() => {
    // Only run if session management hasn't initialized yet
    if (!sessionInitialized) return;

    // Initialize authentication state from localStorage (fallback)
    try {
      const storedUser = AuthService.getStoredUser();
      const storedToken = AuthService.getStoredToken();
      if (storedUser && storedToken && !user) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch {
      // ignore auth initialization errors
    }
  }, [sessionInitialized, user]);

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
  const login = useCallback(async (identifier: string, password: string) => {
    const response = await AuthService.login(identifier, password);
    if (response.success && response.user) {
      setUser(response.user);
      setIsAuthenticated(true);

      // Start session management after successful login
      SessionService.startTokenRefreshTimer();
      console.log("✅ Login successful - session management started");
    } else {
      throw new Error(response.message || "Login failed");
    }
  }, []);

  const register = useCallback(
    async (
      displayName: string,
      email: string,
      password: string
    ): Promise<string> => {
      const response = await AuthService.register(displayName, email, password);
      if (response.success) {
        return response.message || "Registration successful";
      } else {
        throw new Error(response.message || "Registration failed");
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      // Use SessionService for proper logout
      await SessionService.logout();
      console.log("✅ Logout successful");
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.warn("Logout failed, but clearing local state:", error);
      SessionService.clearSession();
    } finally {
      // Always clear local state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Profile management functions
  const refreshProfile = useCallback(async () => {
    try {
      if (!isAuthenticated) return;
      const updatedUser = await ProfileService.getMyProfile();
      setUser(updatedUser);
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      throw error;
    }
  }, [isAuthenticated]);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      const updatedUser = await ProfileService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }, []);

  const uploadProfilePicture = useCallback(
    async (file: File): Promise<string> => {
      try {
        const profilePictureUrl = await ProfileService.uploadProfilePicture(
          file
        );
        // Refresh profile to get updated data
        await refreshProfile();
        return profilePictureUrl;
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        throw error;
      }
    },
    [refreshProfile]
  );

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

      // Profile Management
      refreshProfile,
      updateProfile,
      uploadProfilePicture,
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
      refreshProfile,
      updateProfile,
      uploadProfilePicture,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
