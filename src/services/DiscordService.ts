import { apiFetch } from "../lib/api";
import { API_ENDPOINTS } from "../config/constants";
import type {
  DiscordOAuthCallbackResponse,
  DiscordLinkResponse,
  DiscordUnlinkResponse,
  DiscordUserInfoResponse,
  DiscordRefreshResponse,
  DiscordOAuthConfig,
  DiscordOAuthState,
} from "../types";

/**
 * Discord Authentication Service
 * Handles Discord OAuth, account linking, and user info management
 * Based on APIs #88-93
 */
export class DiscordService {
  private static readonly DISCORD_CONFIG: DiscordOAuthConfig = {
    clientId: "1416218898063429724", // From API spec
    redirectUri: "http://localhost:8080/api/login/oauth2/code/discord", // Backend callback
    scopes: ["identify", "email"],
  };

  private static readonly OAUTH_STATE_KEY = "discord_oauth_state";

  // Get the backend base URL from environment or default
  private static getBackendUrl(): string {
    // Prefer explicit API base (with /api) if provided
    const explicit = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (explicit) {
      return explicit.replace(/\/$/, "");
    }
    const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    // Ensure it ends with /api
    return base.endsWith("/api") ? base : `${base.replace(/\/$/, "")}/api`;
  }

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

      // Generate state for CSRF protection
      const state = this.generateState();
      const oauthState: DiscordOAuthState = {
        state,
        returnUrl: returnUrl || "/",
      };

      // Store state in localStorage for later verification
      localStorage.setItem(this.OAUTH_STATE_KEY, JSON.stringify(oauthState));

      // Redirect to backend OAuth endpoint which will handle Discord OAuth flow
      const frontendUrl = this.getFrontendUrl();
      const base = this.getBackendUrl();
      const path = API_ENDPOINTS.auth.discord.login.startsWith("/")
        ? API_ENDPOINTS.auth.discord.login
        : `/${API_ENDPOINTS.auth.discord.login}`;
      const targetReturn = frontendUrl + (returnUrl || "/");
      const backendOAuthUrl = `${base}${path}?state=${encodeURIComponent(
        state
      )}&return_url=${encodeURIComponent(
        targetReturn
      )}&returnUrl=${encodeURIComponent(targetReturn)}`;

      console.log("🔑 Discord OAuth state:", {
        state,
        targetReturn,
        base,
        path,
      });

      console.log("🔗 Discord OAuth URL:", backendOAuthUrl);
      console.log("🏠 Frontend URL:", frontendUrl);
      // In DiscordService.initiateOAuth - add more logging
      console.log("🔍 OAuth Initiation Debug:", {
        storedState: DiscordService.getStoredOAuthState(),
        currentUrl: window.location.href,
        backendUrl: this.getBackendUrl(),
      });

      window.location.href = backendOAuthUrl;
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
      // Verify state
      const storedStateData = localStorage.getItem(this.OAUTH_STATE_KEY);
      if (!storedStateData) {
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

      // Call backend callback endpoint
      const url = `${
        API_ENDPOINTS.auth.discord.callback
      }?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      const response = await apiFetch<DiscordOAuthCallbackResponse>(url);

      // Success: clear stored state now
      localStorage.removeItem(this.OAUTH_STATE_KEY);
      this.oauthInFlight = false;
      return response;
    } catch (error) {
      console.error("Discord OAuth callback failed:", error);
      this.oauthInFlight = false;
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

      return await apiFetch<DiscordLinkResponse>(
        API_ENDPOINTS.auth.discord.link,
        {
          method: "POST",
          body: formData,
          useFormData: true,
        }
      );
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
      return await apiFetch<DiscordUnlinkResponse>(
        API_ENDPOINTS.auth.discord.unlink,
        {
          method: "POST",
        }
      );
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
      return await apiFetch<DiscordUserInfoResponse>(
        API_ENDPOINTS.auth.discord.userInfo
      );
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
      return await apiFetch<DiscordRefreshResponse>(
        API_ENDPOINTS.auth.discord.refresh,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error("Discord token refresh failed:", error);
      throw new Error("Failed to refresh Discord token");
    }
  }

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
    authUrl.searchParams.append("client_id", this.DISCORD_CONFIG.clientId);
    authUrl.searchParams.append(
      "redirect_uri",
      this.DISCORD_CONFIG.redirectUri
    );
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", this.DISCORD_CONFIG.scopes.join(" "));

    if (state) {
      authUrl.searchParams.append("state", state);
    }

    return authUrl.toString();
  }
}
