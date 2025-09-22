/**
 * Discord Authentication Types
 * Based on Discord OAuth APIs (#88-93)
 */

// Base Discord API Response
export interface DiscordApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Discord User Information
export interface DiscordUser {
  id: string; // Discord snowflake ID
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string;
  verified?: boolean;
  linkedAt?: string; // ISO date string
}

// Discord OAuth State
export interface DiscordOAuthState {
  state: string;
  returnUrl?: string;
}

// API #88: Initiate Discord OAuth
export interface DiscordOAuthInitiateResponse {
  redirectUrl: string;
  state: string;
}

// API #89: Discord OAuth Callback Response
export interface DiscordOAuthCallbackResponse extends DiscordApiResponse {
  token: string;
  user: {
    id: number; // Local user ID
    displayName: string;
    email: string;
    discordId: string;
    profilePictureUrl: string;
    roles: string[];
  };
}

// API #90: Link Discord Account Request
export interface DiscordLinkRequest {
  code: string;
}

// API #90: Link Discord Account Response
export interface DiscordLinkResponse extends DiscordApiResponse {
  discordUser: DiscordUser;
}

// API #91: Unlink Discord Account Response
export type DiscordUnlinkResponse = DiscordApiResponse;

// API #92: Get Discord User Info Response
export interface DiscordUserInfoResponse extends DiscordApiResponse {
  discordUser: DiscordUser;
}

// API #93: Refresh Discord Token Response
export interface DiscordRefreshResponse extends DiscordApiResponse {
  expiresAt: string; // ISO date string
}

// Discord OAuth Configuration
export interface DiscordOAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

// Discord Auth Context State
export interface DiscordAuthState {
  isLinked: boolean;
  discordUser: DiscordUser | null;
  isLoading: boolean;
  error: string | null;
}

// Discord Auth Actions
export type DiscordAuthAction =
  | { type: "DISCORD_LINK_START" }
  | { type: "DISCORD_LINK_SUCCESS"; payload: DiscordUser }
  | { type: "DISCORD_LINK_ERROR"; payload: string }
  | { type: "DISCORD_UNLINK_SUCCESS" }
  | { type: "DISCORD_SET_USER"; payload: DiscordUser | null }
  | { type: "DISCORD_CLEAR_ERROR" };

// Discord Component Props
export interface DiscordLoginButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onSuccess?: (response: DiscordOAuthCallbackResponse) => void;
  onError?: (error: string) => void;
}

export interface DiscordLinkButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onLink?: (discordUser: DiscordUser) => void;
  onUnlink?: () => void;
  onError?: (error: string) => void;
}

export interface DiscordUserInfoProps {
  className?: string;
  showActions?: boolean;
  onUnlink?: () => void;
}
