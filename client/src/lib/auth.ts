// Authentication API utilities
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Auth API functions
export const authAPI = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }

    return response.json();
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign in');
    }

    return response.json();
  },

  async signOut(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.removeItem('authToken');
    }
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        throw new Error('Invalid token');
      }
      throw new Error('Failed to get current user');
    }

    return response.json();
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  clearToken(): void {
    localStorage.removeItem('authToken');
  },
};