import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, type User } from '../../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and get current user
    const checkAuth = async () => {
      try {
        const token = authAPI.getToken();
        if (token) {
          try {
            const { user: currentUser } = await authAPI.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, clear it
            console.warn('Invalid auth token, clearing:', error);
            authAPI.clearToken();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { user, token } = await authAPI.signUp({
        email,
        password,
        firstName,
        lastName,
      });
      
      authAPI.setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, token } = await authAPI.signIn({
        email,
        password,
      });
      
      authAPI.setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
    } catch (error) {
      // Even if the API call fails, clear local state
      authAPI.clearToken();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};