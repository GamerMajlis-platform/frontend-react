// Mock Authentication Service for Development/Testing
import type { User, AuthResponse } from "./AuthService";

export class MockAuthService {
  private static TOKEN_KEY = "authToken";
  private static USER_KEY = "userData";

  // Mock user database for development
  private static mockUsers: Array<User & { password: string }> = [
    {
      id: "1",
      displayName: "Test User",
      email: "test@example.com",
      password: "password123",
    },
  ];

  // Mock response delay to simulate network
  private static async mockDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  static async register(
    displayName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    await this.mockDelay();

    // Check if user already exists
    if (this.mockUsers.find((u) => u.email === email)) {
      throw new Error("User already exists with this email");
    }

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      displayName,
      email,
      password,
    };

    this.mockUsers.push(newUser);

    const { password: _, ...user } = newUser;
    const token = "mock-jwt-token-" + Date.now();

    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    return { user, token };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    await this.mockDelay();

    const user = this.mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = "mock-jwt-token-" + Date.now();

    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token };
  }

  static async logout(): Promise<void> {
    await this.mockDelay();
    // Just clear localStorage for mock mode
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static isAuthenticated(): boolean {
    return !!(this.getStoredToken() && this.getStoredUser());
  }

  static async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = this.getStoredToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    // Mock authenticated requests
    await this.mockDelay();

    // Return a mock successful response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
