export interface LoginFormData extends Record<string, unknown> {
  identifier: string; // Can be email or displayName
  password: string;
  general?: string; // For general error messages
}

export interface SignupFormData extends Record<string, unknown> {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  general?: string; // For general error messages
}

export interface User {
  id: number;
  displayName: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  roles: string[];
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  discordUsername?: string;
  gamingPreferences?: string; // JSON string
  socialLinks?: string; // JSON string
  gamingStatistics?: string; // JSON string
  privacySettings?: string; // JSON string
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Backend API Response Types
export interface BackendResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse extends BackendResponse {
  token: string;
  user: User;
}

export interface SignupResponse extends BackendResponse {
  userId: number;
}

export interface TokenValidationResponse {
  valid: boolean;
  userId: number;
  username: string;
  message: string;
}

export interface ProfileResponse extends BackendResponse {
  user: User;
}

// Profile Update Types
export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  gamingPreferences?: string; // JSON string
  socialLinks?: string; // JSON string
  privacySettings?: string; // JSON string
}
