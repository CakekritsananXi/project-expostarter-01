import React from 'react';
import { useAuth } from './AuthProvider';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    console.log('ProtectedRoute - isLoading:', isLoading, 'user:', !!user);

    if (!isLoading && !user) {
      console.log('No user found, redirecting to login');
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    console.log('ProtectedRoute - showing loading spinner');
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - no user, returning null');
    return null;
  }

  console.log('ProtectedRoute - user authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;