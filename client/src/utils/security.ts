// Client-side security utilities

// XSS Protection
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Input validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  phone: /^\+?[\d\s\-\(\)]{10,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noScripts: /^(?!.*<script).*$/i,
};

// Client-side validation functions
export const validateField = (value: string, type: keyof typeof validationPatterns): boolean => {
  if (!value || typeof value !== 'string') return false;
  return validationPatterns[type].test(value);
};

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!validateField(email, 'email')) return { isValid: false, message: 'Invalid email format' };
  if (email.length > 254) return { isValid: false, message: 'Email is too long' };
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) return { isValid: false, message: 'Password is required' };
  if (password.length < 8) return { isValid: false, message: 'Password must be at least 8 characters' };
  if (password.length > 128) return { isValid: false, message: 'Password is too long' };
  if (!validateField(password, 'password')) {
    return { 
      isValid: false, 
      message: 'Password must contain uppercase, lowercase, number, and special character' 
    };
  }
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name) return { isValid: false, message: 'Name is required' };
  if (!validateField(name, 'name')) return { isValid: false, message: 'Invalid name format' };
  return { isValid: true };
};

// CSRF Token Management
export class CSRFManager {
  private static sessionId: string = '';
  private static csrfToken: string = '';

  static setSession(sessionId: string, csrfToken: string) {
    this.sessionId = sessionId;
    this.csrfToken = csrfToken;
  }

  static getHeaders(): Record<string, string> {
    return {
      'X-Session-ID': this.sessionId,
      'X-CSRF-Token': this.csrfToken,
    };
  }

  static async refreshToken(): Promise<void> {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.setSession(data.sessionId, data.csrfToken);
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
  }
}

// Content Security Policy reporting
export const reportCSPViolation = (violationReport: any) => {
  console.warn('CSP Violation:', violationReport);
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(violationReport),
    }).catch(err => console.error('Failed to report CSP violation:', err));
  }
};

// Secure data storage
export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple XOR encryption for basic obfuscation
    const key = 'contentflow-security-key';
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  private static decrypt(data: string): string {
    try {
      const decoded = atob(data);
      const key = 'contentflow-security-key';
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return '';
    }
  }

  static setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, this.encrypt(value));
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  static getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      return encrypted ? this.decrypt(encrypted) : null;
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

// Input sanitization for display
export const sanitizeForDisplay = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting helper
export class ClientRateLimit {
  private static requests = new Map<string, number[]>();

  static checkLimit(endpoint: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }
    
    const endpointRequests = this.requests.get(endpoint)!;
    
    // Remove old requests outside the window
    const recentRequests = endpointRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    
    return true;
  }
}