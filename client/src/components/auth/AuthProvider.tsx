import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI, type User } from '../../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Renamed from loading to isLoading for clarity with useCallback

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log('Checking auth status, token present:', !!token);

    if (!token) {
      console.log('No token found, setting loading to false');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Making auth check request to /api/auth/me');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth check response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Auth check successful, user:', data.user);
        setUser(data.user);
      } else {
        console.log('Auth check failed, removing token');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      console.log('Auth check complete, setting loading to false');
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Assuming authAPI.signUp internally uses localStorage for token management
      const { user, token } = await authAPI.signUp({
        email,
        password,
        firstName,
        lastName,
      });

      // Set token and user in local state
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Signin response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('Signin failed:', errorData);
      throw new Error(errorData.error || 'Failed to sign in');
    }

    const data = await response.json();
    console.log('Signin successful, user:', data.user);
    console.log('Token received:', !!data.token);

    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data;
  };

  const signOut = async () => {
    console.log('Signing out user');

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      console.log('Clearing user data and token');
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    loading: isLoading, // Use the renamed state variable
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Ensure consistent export for Fast Refresh
AuthProvider.displayName = 'AuthProvider';