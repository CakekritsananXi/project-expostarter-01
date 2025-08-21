import React from 'react';
import { Navigate } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import LoginForm from '../components/auth/LoginForm';
import Card from '../components/ui/Card';

const Login = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome back</h1>
          <p className="text-neutral-600">Sign in to your ContentFlow account</p>
        </div>

        <Card>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
};

export default Login;