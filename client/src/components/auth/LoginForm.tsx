import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { validateEmail, CSRFManager, ClientRateLimit, sanitizeInput } from '../../utils/security';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Initialize CSRF token
  useEffect(() => {
    CSRFManager.refreshToken();
  }, []);

  const validateEmailField = (value: string) => {
    const result = validateEmail(value);
    setEmailError(result.isValid ? '' : result.message || 'Invalid email');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setEmail(sanitizedValue);
    if (touched.email) {
      validateEmailField(sanitizedValue);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setPassword(sanitizedValue);
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    validateEmailField(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!ClientRateLimit.checkLimit('login', 5, 300000)) { // 5 attempts per 5 minutes
      setError('Too many login attempts. Please wait before trying again.');
      return;
    }

    // Client-side validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message || 'Invalid email format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-1">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          icon={Mail}
          placeholder="Enter your email"
          required
          className={emailError && touched.email ? 'border-red-300' : ''}
          data-testid="input-email"
        />
        {emailError && touched.email && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {emailError}
          </p>
        )}
      </div>

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          icon={Lock}
          placeholder="Enter your password"
          required
          data-testid="input-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        disabled={loading || !!emailError}
        className="w-full"
        data-testid="button-submit"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      <div className="text-center">
        <p className="text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-sage hover:text-sage/80 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;