import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthService } from "../services/AuthService";
import { ProfileService } from "../services/ProfileService";
import EventService from "../services/EventService";
import TournamentService from "../services/TournamentService";
import { apiFetch } from "../lib/api";
import { API_ENDPOINTS } from "../config/constants";
import { SessionService } from "../services/SessionService";
import { STORAGE_KEYS } from "../config/constants";
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
    showGamingStats: boolean;
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

  // Events
  registeredEvents: number[]; // Array of event IDs user is registered for
  isRegisteredForEvent: (eventId: number) => boolean;
  registerForEvent: (eventId: number) => Promise<void>;
  unregisterFromEvent: (eventId: number) => Promise<void>;
  refreshEventRegistrations: () => Promise<void>;

  // Tournaments
  registeredTournaments: number[]; // Array of tournament IDs user is registered for
  isRegisteredForTournament: (tournamentId: number) => boolean;
  registerForTournament: (tournamentId: number) => Promise<void>;
  unregisterFromTournament: (tournamentId: number) => Promise<void>;
  refreshTournamentRegistrations: () => Promise<void>;

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
  removeProfilePicture: () => Promise<void>;
  updateGamingStats: (stats: Record<string, unknown>) => Promise<void>;
  getUserProfile: (userId: number) => Promise<User>;
}

const AppContext = createContext<AppContextShape | undefined>(undefined);

export { AppContext };

const defaultSettings: UserSettings = {
  privacy: {
    profileVisibility: "public",
    showOnlineStatus: true,
    showGamingStats: true,
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
            // Set a quick optimistic user from storage, then refresh from server
            setUser(storedUser);
            setIsAuthenticated(true);
            console.log(
              "✅ Session restored (optimistic) for user:",
              storedUser.email
            );

            // Refresh server-side profile to ensure latest data
            try {
              const fresh = await ProfileService.getMyProfile();
              if (fresh) {
                setUser(fresh);
                // Sync server-side settings into local settings if present
                try {
                  const serverPrivacy = fresh.privacySettings
                    ? JSON.parse(fresh.privacySettings)
                    : null;
                  const serverPrefs = fresh.gamingPreferences
                    ? JSON.parse(fresh.gamingPreferences)
                    : null;

                  setSettings((prev) => ({
                    ...prev,
                    ...(serverPrivacy
                      ? { privacy: { ...prev.privacy, ...serverPrivacy } }
                      : {}),
                    ...(serverPrefs
                      ? { preferences: { ...prev.preferences, ...serverPrefs } }
                      : {}),
                  }));
                } catch (e) {
                  console.warn(
                    "Failed to parse server settings from profile:",
                    e
                  );
                }
                // Initialize wishlist from server side product flags (inWishlist)
                try {
                  const productsRespRaw = await apiFetch(
                    `${API_ENDPOINTS.products.list}?page=0&size=100`
                  );

                  // productsRespRaw may be { products: [...] } or { data: [...] } depending on API shapes
                  const productsListRaw = productsRespRaw as unknown as Record<
                    string,
                    unknown
                  >;
                  const productsListCandidate = Array.isArray(
                    productsListRaw.products
                  )
                    ? (productsListRaw.products as unknown[])
                    : Array.isArray(productsListRaw.data)
                    ? (productsListRaw.data as unknown[])
                    : [];

                  function isProductWithWishlistFlag(
                    x: unknown
                  ): x is Record<string, unknown> {
                    return (
                      typeof x === "object" &&
                      x !== null &&
                      "inWishlist" in (x as Record<string, unknown>)
                    );
                  }

                  function getSellerDisplay(
                    seller: unknown,
                    fallback?: unknown
                  ) {
                    if (!seller) return String(fallback ?? "");
                    if (typeof seller === "string") return seller;
                    if (typeof seller === "object" && seller !== null) {
                      const s = seller as Record<string, unknown>;
                      if (s.displayName && typeof s.displayName === "string")
                        return s.displayName;
                      if (s.name && typeof s.name === "string") return s.name;
                    }
                    return String(fallback ?? "");
                  }

                  const serverWishlist: WishlistItem[] = productsListCandidate
                    .filter(isProductWithWishlistFlag)
                    .filter((p) =>
                      Boolean((p as Record<string, unknown>).inWishlist)
                    )
                    .map((p) => {
                      const item = p as Record<string, unknown>;
                      const id = item.id ?? item["productId"] ?? 0;
                      return {
                        id: Number(id),
                        category: String(
                          item.category ?? item.gameCategory ?? ""
                        ),
                        productName: String(
                          item.name ?? item.productName ?? ""
                        ),
                        seller: getSellerDisplay(item.seller, item.sellerName),
                        price: String(item.price ?? ""),
                        rate: String(item.averageRating ?? ""),
                        reviews: String(item.totalReviews ?? ""),
                        imageUrl: (item.mainImageUrl ?? item.imageUrl) as
                          | string
                          | undefined,
                        dateAdded:
                          (item.wishlistAddedAt as string) ??
                          new Date().toISOString(),
                      } as WishlistItem;
                    });

                  if (serverWishlist.length > 0) {
                    setWishlist(serverWishlist);
                  }
                } catch (e) {
                  console.warn("Failed to initialize wishlist from server:", e);
                }
                try {
                  localStorage.setItem(
                    STORAGE_KEYS.user,
                    JSON.stringify(fresh)
                  );
                } catch {
                  // ignore storage errors
                }
                console.log(
                  "🔄 Profile refreshed from server for user:",
                  fresh.email
                );
              }
            } catch (err) {
              console.warn(
                "Failed to refresh profile during session init:",
                err
              );
            }
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
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to home instead of login for expired sessions
      window.location.href = "/";
    });

    cleanupLogoutHandler = SessionService.onLogout(() => {
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
  }, [setSettings, setWishlist]);

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
      setWishlist((prev: WishlistItem[]) => {
        const exists = prev.some((w: WishlistItem) => w.id === item.id);
        const newList = exists
          ? prev
          : [{ ...item, dateAdded: new Date().toISOString() }, ...prev];

        // Fire-and-forget: toggle wishlist on product endpoint
        (async () => {
          try {
            await apiFetch(
              `${API_ENDPOINTS.products.toggleWishlist}/${item.id}/wishlist`,
              {
                method: "POST",
              }
            );
          } catch (err) {
            console.warn("Failed to toggle product wishlist on server:", err);
          }
        })();

        return newList;
      });
    },
    [setWishlist]
  );

  const removeFromWishlist = useCallback(
    (id: number) => {
      setWishlist((prev: WishlistItem[]) => {
        const newList = prev.filter((w: WishlistItem) => w.id !== id);

        // Use the toggle wishlist endpoint to remove from wishlist on server
        (async () => {
          try {
            await apiFetch(
              `${API_ENDPOINTS.products.toggleWishlist}/${id}/wishlist`,
              {
                method: "POST",
              }
            );
          } catch (err) {
            console.warn("Failed to toggle product wishlist on server:", err);
          }
        })();

        return newList;
      });
    },
    [setWishlist]
  );

  const toggleWishlist = useCallback(
    (item: Product) => {
      setWishlist((prev: WishlistItem[]) => {
        const exists = prev.some((w: WishlistItem) => w.id === item.id);
        const newList = exists
          ? prev.filter((w: WishlistItem) => w.id !== item.id)
          : [{ ...item, dateAdded: new Date().toISOString() }, ...prev];

        // Fire-and-forget: toggle wishlist on product endpoint
        (async () => {
          try {
            await apiFetch(
              `${API_ENDPOINTS.products.toggleWishlist}/${item.id}/wishlist`,
              {
                method: "POST",
              }
            );
          } catch (err) {
            console.warn("Failed to toggle product wishlist on server:", err);
          }
        })();

        return newList;
      });
    },
    [setWishlist]
  );

  // Server-sync for settings updates
  const updateSetting: AppContextShape["updateSetting"] = useCallback(
    (category, key, value) => {
      setSettings((prev: UserSettings) => {
        const updated = {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value as never,
          },
        };

        // Persist settings to server using profile update (privacy/preferences stored in profile)
        (async () => {
          try {
            // Map our settings shape to profile fields expected by the API
            const profileUpdate: Partial<
              import("../types/auth").UpdateProfileData
            > = {};
            if (updated.privacy) {
              profileUpdate.privacySettings = JSON.stringify(updated.privacy);
            }
            if (updated.preferences) {
              // Persist only the preferences keys we expose (language)
              profileUpdate.gamingPreferences = JSON.stringify({
                language: updated.preferences.language,
              });
            }

            await ProfileService.updateProfile(profileUpdate);
          } catch (err) {
            console.warn("Failed to persist settings via ProfileService:", err);
          }
        })();

        return updated;
      });
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
      // Update localStorage using STORAGE_KEYS
      try {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
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

  const removeProfilePicture = useCallback(async () => {
    try {
      await ProfileService.removeProfilePicture();
      // Refresh profile to get updated data
      await refreshProfile();
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      throw error;
    }
  }, [refreshProfile]);

  const updateGamingStats = useCallback(
    async (stats: Record<string, unknown>) => {
      try {
        await ProfileService.updateGamingStats(stats);
        // Refresh profile to get updated data
        await refreshProfile();
      } catch (error) {
        console.error("Failed to update gaming stats:", error);
        throw error;
      }
    },
    [refreshProfile]
  );

  const getUserProfile = useCallback(async (userId: number): Promise<User> => {
    try {
      return await ProfileService.getUserProfile(userId);
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  }, []);

  // Event state management
  const [registeredEvents, setRegisteredEvents] = useLocalStorage<number[]>(
    "registeredEvents",
    []
  );

  const isRegisteredForEvent = useCallback(
    (eventId: number): boolean => {
      return registeredEvents.includes(eventId);
    },
    [registeredEvents]
  );

  const registerForEvent = useCallback(
    async (eventId: number): Promise<void> => {
      try {
        await EventService.registerForEvent(eventId);
        setRegisteredEvents((prev) => [...prev, eventId]);
      } catch (error) {
        console.error("Failed to register for event:", error);
        throw error;
      }
    },
    [setRegisteredEvents]
  );

  const unregisterFromEvent = useCallback(
    async (eventId: number): Promise<void> => {
      try {
        await EventService.unregisterFromEvent(eventId);
        setRegisteredEvents((prev) => prev.filter((id) => id !== eventId));
      } catch (error) {
        console.error("Failed to unregister from event:", error);
        throw error;
      }
    },
    [setRegisteredEvents]
  );

  const refreshEventRegistrations = useCallback(async (): Promise<void> => {
    // This would typically fetch user's registered events from backend
    // For now, we keep the local storage state
    // In a real implementation, you'd call something like:
    // const userEvents = await EventService.getUserRegisteredEvents();
    // setRegisteredEvents(userEvents.map(event => event.id));
    console.log("Refreshing event registrations...");
  }, []);

  // Tournament state management
  const [registeredTournaments, setRegisteredTournaments] = useLocalStorage<
    number[]
  >("registeredTournaments", []);

  const isRegisteredForTournament = useCallback(
    (tournamentId: number): boolean => {
      return registeredTournaments.includes(tournamentId);
    },
    [registeredTournaments]
  );

  const registerForTournament = useCallback(
    async (tournamentId: number): Promise<void> => {
      try {
        if (!user?.id) {
          throw new Error("User must be logged in to register for tournaments");
        }
        await TournamentService.registerForTournament(tournamentId, user.id);
        setRegisteredTournaments((prev) => [...prev, tournamentId]);
      } catch (error) {
        console.error("Failed to register for tournament:", error);
        throw error;
      }
    },
    [setRegisteredTournaments, user]
  );

  const unregisterFromTournament = useCallback(
    async (tournamentId: number): Promise<void> => {
      try {
        // TODO: Add unregister API endpoint to TournamentService
        // For now, just remove from local storage
        console.warn("Unregister from tournament API not implemented yet");
        setRegisteredTournaments((prev) =>
          prev.filter((id) => id !== tournamentId)
        );
      } catch (error) {
        console.error("Failed to unregister from tournament:", error);
        throw error;
      }
    },
    [setRegisteredTournaments]
  );

  const refreshTournamentRegistrations =
    useCallback(async (): Promise<void> => {
      // This would typically fetch user's registered tournaments from backend
      // For now, we keep the local storage state
      // In a real implementation, you'd call something like:
      // const userTournaments = await TournamentService.getUserRegisteredTournaments();
      // setRegisteredTournaments(userTournaments.map(tournament => tournament.id));
      console.log("Refreshing tournament registrations...");
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

      // Profile Management
      refreshProfile,
      updateProfile,
      uploadProfilePicture,
      removeProfilePicture,
      updateGamingStats,
      getUserProfile,

      // Events
      registeredEvents,
      isRegisteredForEvent,
      registerForEvent,
      unregisterFromEvent,
      refreshEventRegistrations,

      // Tournaments
      registeredTournaments,
      isRegisteredForTournament,
      registerForTournament,
      unregisterFromTournament,
      refreshTournamentRegistrations,
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
      removeProfilePicture,
      updateGamingStats,
      getUserProfile,
      registeredEvents,
      isRegisteredForEvent,
      registerForEvent,
      unregisterFromEvent,
      refreshEventRegistrations,
      registeredTournaments,
      isRegisteredForTournament,
      registerForTournament,
      unregisterFromTournament,
      refreshTournamentRegistrations,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
