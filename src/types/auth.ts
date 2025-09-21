export interface LoginFormData extends Record<string, unknown> {
  email: string;
  password: string;
  general?: string; // For general error messages
}

export interface SignupFormData extends Record<string, unknown> {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  general?: string; // For general error messages
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
