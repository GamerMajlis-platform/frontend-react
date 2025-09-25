/**
 * Navigation Service
 *
 * Centralizes navigation logic to ensure consistent routing behavior,
 * especially for session-related redirects and SPA navigation.
 */

// Navigation utility that works with React Router
export class NavigationService {
  private static navigate:
    | ((path: string, options?: { replace?: boolean }) => void)
    | null = null;

  /**
   * Initialize the navigation service with React Router's navigate function
   * This should be called from the root of the app after router is set up
   */
  static initialize(
    navigateFunction: (path: string, options?: { replace?: boolean }) => void
  ): void {
    this.navigate = navigateFunction;
  }

  /**
   * Navigate to a path using React Router (SPA navigation)
   */
  static navigateTo(path: string, options?: { replace?: boolean }): void {
    if (this.navigate) {
      this.navigate(path, options);
    } else {
      console.warn(
        "NavigationService not initialized, falling back to window.location"
      );
      if (options?.replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    }
  }

  /**
   * Navigate to home page (used for logout/session expired)
   */
  static navigateToHome(): void {
    this.navigateTo("/", { replace: true });
  }

  /**
   * Navigate to login page
   */
  static navigateToLogin(returnUrl?: string): void {
    const loginPath = returnUrl
      ? `/login?return=${encodeURIComponent(returnUrl)}`
      : "/login";
    this.navigateTo(loginPath, { replace: true });
  }

  /**
   * Hard reload the page (for critical errors or when SPA navigation is insufficient)
   */
  static hardReload(): void {
    window.location.reload();
  }

  /**
   * Hard redirect (full page navigation, not SPA)
   */
  static hardRedirect(url: string): void {
    window.location.href = url;
  }

  /**
   * Get current path
   */
  static getCurrentPath(): string {
    return window.location.pathname;
  }

  /**
   * Get query parameters from current URL
   */
  static getQueryParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Get return URL from query parameters (used for login redirects)
   */
  static getReturnUrl(): string | null {
    const params = this.getQueryParams();
    return params.get("return") || params.get("returnUrl");
  }
}
