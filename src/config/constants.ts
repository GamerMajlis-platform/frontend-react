// Application constants and configuration

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1400,
  extraLarge: 1440,
} as const;

// Media query helpers
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.mobile - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${
    BREAKPOINTS.desktop - 1
  }px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  largeDesktop: `(min-width: ${BREAKPOINTS.largeDesktop}px)`,

  // Tailwind-compatible breakpoints
  sm: `(max-width: ${BREAKPOINTS.mobile}px)`, // Tailwind's sm breakpoint
  md: `(min-width: ${BREAKPOINTS.mobile}px)`,
  lg: `(min-width: ${BREAKPOINTS.desktop}px)`,
  xl: `(min-width: ${BREAKPOINTS.largeDesktop}px)`,
} as const;

// ===== ANIMATION DURATIONS =====
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
} as const;

// ===== STORAGE KEYS =====
export const STORAGE_KEYS = {
  settings: "gamerMajlis_settings",
  wishlist: "gamerMajlis_wishlist",
  auth: "gamerMajlis_auth",
  user: "gamerMajlis_user",
  preferences: "gamerMajlis_preferences",
  language: "gamerMajlis_language",
  session: "gamerMajlis_session",
} as const;

// ===== API CONFIGURATION =====
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    me: "/auth/me",
    validateToken: "/auth/validate-token",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
  },

  // Profile endpoints
  profile: {
    me: "/profile/me",
    byId: "/profile", // append /{userId}
    update: "/profile/me", // PUT request
    uploadPicture: "/profile/me/profile-picture",
    removePicture: "/profile/me/profile-picture",
    updateStats: "/profile/me/gaming-stats",
  },

  // Data endpoints (to be updated later)
  products: "/products",
  tournaments: "/tournaments",
  events: "/events",
  messages: "/messages",
  conversations: "/conversations",

  // File uploads
  uploads: "/uploads",
} as const;

// ===== UI CONSTANTS =====
export const UI_CONSTANTS = {
  // Form dimensions
  authFormMaxWidth: {
    mobile: 500,
    tablet: 600,
    desktop: 802,
  },

  // Modal sizes
  modalSizes: {
    sm: 400,
    md: 600,
    lg: 800,
    xl: 1000,
  },

  // Container max widths
  containerMaxWidths: {
    content: 1400,
    form: 720,
    search: 800,
    card: 345,
  },

  // Avatar sizes
  avatarSizes: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    xxl: 128,
  },

  // Icon sizes
  iconSizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  // Z-index layers
  zIndex: {
    background: -1,
    base: 0,
    content: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    dropdown: 50,
    tooltip: 60,
    toast: 70,
  },
} as const;

// ===== THEME CONSTANTS =====
export const THEME_CONSTANTS = {
  // Brand colors (matching existing design)
  colors: {
    primary: "#6FFFE9",
    primaryHover: "#5ee6d3",
    secondary: "#C4FFF9",
    accent: "#5BC0BE",

    // Background colors
    background: {
      primary: "#0B132B",
      secondary: "#1C2541",
      tertiary: "#3A506B",
    },

    // Text colors
    text: {
      primary: "#EEEEEE",
      secondary: "#9CA3AF",
      muted: "#64748b",
      accent: "#C4FFF9",
    },

    // Status colors
    status: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },

    // Border colors
    border: {
      primary: "#475569",
      secondary: "rgba(255,255,255,0.28)",
      focus: "#6fffe9",
      error: "rgba(239,68,68,0.3)",
    },
  },

  // Border radius values
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },

  // Shadow values
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    auth: "0 8px 30px rgba(2,8,23,0.6)",
  },
} as const;

// ===== FORM VALIDATION =====
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 6,
    maxLength: 128,
  },
  search: {
    minLength: 1,
    maxLength: 100,
  },
} as const;

// ===== PAGINATION =====
export const PAGINATION = {
  defaultPageSize: 12,
  pageSizeOptions: [6, 12, 24, 48],
  maxPaginationButtons: 5,
} as const;

// ===== DELAYS AND TIMEOUTS =====
export const DELAYS = {
  debounce: {
    search: 300,
    input: 150,
    api: 500,
  },

  autofill: {
    detection: 150,
  },

  notification: {
    default: 5000,
    error: 8000,
    success: 3000,
  },

  tooltip: {
    show: 200,
    hide: 100,
  },
} as const;

// ===== SUPPORTED LANGUAGES =====
export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;

// ===== DEFAULT VALUES =====
export const DEFAULTS = {
  language: "en",
  itemsPerPage: 12,
  sortOrder: "asc",
  category: "all",

  // User settings defaults
  settings: {
    language: "en",
    privacy: {
      profileVisibility: "public" as const,
      showOnlineStatus: true,
    },
  },
} as const;
