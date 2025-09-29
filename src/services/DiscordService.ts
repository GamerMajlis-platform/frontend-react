import { BaseService } from "../lib/baseService";
import { API_ENDPOINTS } from "../config/constants";
import type {
  DiscordOAuthCallbackResponse,
  DiscordLinkResponse,
  DiscordUnlinkResponse,
  DiscordUserInfoResponse,
  DiscordRefreshResponse,
  DiscordOAuthState,
} from "../types";

/**
 * Discord Authentication Service
 * Handles Discord OAuth, account linking, and user info management
 * Based on APIs #88-93
 */
export class DiscordService extends BaseService {
  private static readonly DISCORD_CLIENT_ID = "1416218898063429724";
  private static getDiscordRedirectUri(): string {
    // Use the frontend origin as the redirect URI so Discord will redirect
    // back to the frontend (e.g. http://localhost:3000/auth/discord/callback).
    // This matches the previous working flow where the frontend handled the
    // callback UI and then asked the backend to exchange the code.
    const cbPath = API_ENDPOINTS.auth.discord.callback.startsWith("/")
      ? API_ENDPOINTS.auth.discord.callback
      : `/${API_ENDPOINTS.auth.discord.callback}`;
    return `${this.getFrontendUrl()}${cbPath}`;
  }

  private static readonly DISCORD_SCOPES = ["identify", "email"];

  private static readonly OAUTH_STATE_KEY = "discord_oauth_state";

  // (no global backend helper here - kept minimal for Discord service)

  /**
   * Discord-specific backend base.
   * Use VITE_DISCORD_AUTH_BASE_URL if provided, otherwise default to localhost:3000
   * This keeps other API calls pointing at the default backend while directing
   * Discord-auth calls to the auth server which may run on a different port.
   */
  // (no discord-specific backend base — keep Discord auth callback on frontend)

  // Get the frontend base URL from the current window origin. This allows
  // running the frontend on different ports (3000, 3001, etc.) without forcing
  // a specific port in code; the backend must still accept the origin used.
  private static getFrontendUrl(): string {
    return window.location.origin.replace(/\/$/, "");
  }

  private static oauthInFlight = false;
  private static oauthLastAt = 0;
  private static readonly OAUTH_COOLDOWN_MS = 2000;

  /**
   * Generate secure random state for OAuth CSRF protection
   */
  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * API #88: Initiate Discord OAuth
   * Redirect to backend OAuth endpoint which handles Discord OAuth flow
   */
  static async initiateOAuth(returnUrl?: string): Promise<void> {
    try {
      if (
        this.oauthInFlight &&
        Date.now() - this.oauthLastAt < this.OAUTH_COOLDOWN_MS
      ) {
        console.warn("Discord OAuth initiation suppressed: cooldown active");
        return;
      }
      this.oauthInFlight = true;
      this.oauthLastAt = Date.now();

      // Generate state for CSRF protection and store return URL
      const state = this.generateState();
      const oauthState: DiscordOAuthState = {
        state,
        returnUrl: returnUrl || "/",
      };
      localStorage.setItem(this.OAUTH_STATE_KEY, JSON.stringify(oauthState));

      // Build Discord authorize URL from frontend so redirect_uri points at
      // the frontend (e.g. http://localhost:3000/auth/discord/callback)
      const authUrl = this.buildOAuthUrl(state);
      console.log("🔗 Redirecting to Discord authorize URL:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Discord OAuth initiation failed:", error);
      throw new Error("Failed to initiate Discord authentication");
    }
  }

  /**
   * API #89: Handle Discord OAuth Callback
   * Processes OAuth callback and returns authentication result
   */
  static async handleOAuthCallback(
    code: string,
    state: string
  ): Promise<DiscordOAuthCallbackResponse> {
    try {
      // Verify state stored in localStorage (frontend initiated flow)
      const storedStateData = localStorage.getItem(this.OAUTH_STATE_KEY);
      if (!storedStateData) {
        console.error("OAuth state not found in storage");
        throw new Error("OAuth state not found");
      }
      const oauthState: DiscordOAuthState = JSON.parse(storedStateData);
      if (oauthState.state !== state) {
        console.error("OAuth state mismatch", {
          stored: oauthState.state,
          received: state,
        });
        throw new Error("Invalid OAuth state");
      }

      // Call backend callback endpoint to exchange code for token. Use the
      // relative API path so the request goes to the configured backend.
      const redirectUri = DiscordService.getDiscordRedirectUri();
      const url = `${
        API_ENDPOINTS.auth.discord.callback
      }?code=${encodeURIComponent(code)}&state=${encodeURIComponent(
        state
      )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      // Log the exact backend callback URL used for token exchange so we can
      // correlate with server logs and the network tab when debugging failures.
      if (import.meta.env.DEV) {
        console.debug("Discord OAuth callback request URL:", url);
      }
      const response = (await this.requestWithRetry(
        url
      )) as DiscordOAuthCallbackResponse;

      // Success: clear stored state now
      localStorage.removeItem(this.OAUTH_STATE_KEY);
      this.oauthInFlight = false;
      return response;
    } catch (error) {
      // Preserve and rethrow the original error so calling code (and UI)
      // can access the server-provided message (for debugging during dev).
      console.error("Discord OAuth callback failed:", error);
      this.oauthInFlight = false;
      // If the error is already an Error (or ApiError), rethrow it to keep
      // the original message and metadata. Otherwise wrap it minimally.
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Discord authentication failed");
    }
  }

  /**
   * Parse token in case backend redirected directly with ?token=... to current URL
   */
  static extractTokenFromLocation(): string | null {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      return token || null;
    } catch {
      return null;
    }
  }

  /**
   * API #90: Link Discord Account
   * Links Discord account to existing user account
   */
  static async linkAccount(code: string): Promise<DiscordLinkResponse> {
    try {
      const formData = new FormData();
      formData.append("code", code);

      return (await this.authenticatedRequest(API_ENDPOINTS.auth.discord.link, {
        method: "POST",
        body: formData,
      })) as DiscordLinkResponse;
    } catch (error) {
      console.error("Discord account linking failed:", error);
      throw new Error("Failed to link Discord account");
    }
  }

  /**
   * API #91: Unlink Discord Account
   * Removes Discord account link from user account
   */
  static async unlinkAccount(): Promise<DiscordUnlinkResponse> {
    try {
      return (await this.authenticatedRequest(
        API_ENDPOINTS.auth.discord.unlink,
        {
          method: "POST",
        }
      )) as DiscordUnlinkResponse;
    } catch (error) {
      console.error("Discord account unlinking failed:", error);
      throw new Error("Failed to unlink Discord account");
    }
  }

  /**
   * API #92: Get Discord User Info
   * Retrieves linked Discord account information
   */
  static async getUserInfo(): Promise<DiscordUserInfoResponse> {
    try {
      return (await this.authenticatedRequest(
        API_ENDPOINTS.auth.discord.userInfo
      )) as DiscordUserInfoResponse;
    } catch (error) {
      console.error("Discord user info retrieval failed:", error);
      throw new Error("Failed to retrieve Discord user info");
    }
  }

  /**
   * API #93: Refresh Discord Token
   * Refreshes Discord access token
   */
  static async refreshToken(): Promise<DiscordRefreshResponse> {
    try {
      return (await this.authenticatedRequest(
        API_ENDPOINTS.auth.discord.refresh,
        {
          method: "POST",
        }
      )) as DiscordRefreshResponse;
    } catch (error) {
      console.error("Discord token refresh failed:", error);
      throw new Error("Failed to refresh Discord token");
    }
  }
  /**
   * Get stored OAuth state from localStorage
   */
  static getStoredOAuthState(): DiscordOAuthState | null {
    try {
      const storedState = localStorage.getItem(this.OAUTH_STATE_KEY);
      return storedState ? JSON.parse(storedState) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear stored OAuth state
   */
  static clearOAuthState(): void {
    localStorage.removeItem(this.OAUTH_STATE_KEY);
  }

  /**
   * Check if user has Discord account linked
   * This is a client-side check - server should be authoritative
   */
  static async isLinked(): Promise<boolean> {
    try {
      const response = await this.getUserInfo();
      return response.success && !!response.discordUser;
    } catch {
      return false;
    }
  }

  /**
   * Build Discord OAuth URL for manual use
   */
  static buildOAuthUrl(state?: string): string {
    const authUrl = new URL("https://discord.com/api/oauth2/authorize");
    authUrl.searchParams.append("client_id", this.DISCORD_CLIENT_ID);
    authUrl.searchParams.append(
      "redirect_uri",
      DiscordService.getDiscordRedirectUri()
    );
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", this.DISCORD_SCOPES.join(" "));

    if (state) {
      authUrl.searchParams.append("state", state);
    }

    return authUrl.toString();
  }
}
