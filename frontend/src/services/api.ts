// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

class ApiService {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      const newToken = data.data?.accessToken;

      if (newToken) {
        localStorage.setItem('accessToken', newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      // Clear auth data and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    console.log('API Request:', { url, method: options.method || 'GET' });

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expired - attempt refresh
        if (response.status === 401 && data.message === 'Access token expired' && retry) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            const newToken = await this.refreshToken();
            this.isRefreshing = false;

            if (newToken) {
              this.onTokenRefreshed(newToken);
              // Retry the original request with new token
              return this.request<T>(endpoint, options, false);
            }
          } else {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.subscribeTokenRefresh(() => {
                resolve(this.request<T>(endpoint, options, false));
              });
            });
          }
        }
        throw data;
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);

      // If it's already an API error response, rethrow it
      if (error.success === false) {
        throw error;
      }

      // Network error or fetch failed
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw {
          success: false,
          message: `Cannot connect to server at ${this.baseURL}. Please ensure the backend is running.`,
        };
      }

      // Otherwise, it's a network or other error
      throw {
        success: false,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService(API_BASE_URL);
