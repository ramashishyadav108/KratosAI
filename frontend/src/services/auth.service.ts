import { api, ApiResponse } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

class AuthService {
  async signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/api/auth/signup', data);
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/api/auth/login', data);
  }

  async logout(): Promise<ApiResponse> {
    return api.post('/api/auth/logout');
  }

  async refresh(): Promise<ApiResponse<RefreshTokenResponse>> {
    return api.post<RefreshTokenResponse>('/api/auth/refresh');
  }

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    return api.get('/api/auth/profile');
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return api.post('/api/auth/request-password-reset', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return api.post('/api/auth/reset-password', { token, newPassword });
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ user: any }>> {
    return api.get(`/api/auth/verify-email?token=${token}`);
  }

  // Google OAuth - redirects to backend OAuth URL
  initiateGoogleLogin(): void {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  }

  // Store tokens in localStorage (optional - you might prefer using httpOnly cookies only)
  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  removeAccessToken(): void {
    localStorage.removeItem('accessToken');
  }

  // Store user data
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem('user');
  }

  // Clear all auth data
  clearAuthData(): void {
    this.removeAccessToken();
    this.removeUser();
  }
}

export const authService = new AuthService();
