import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import validator from 'validator';
import * as crypto from 'crypto';

// XSS Protection Middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Recursive function to sanitize object properties
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return xss(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

// Input Validation Middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Validate email format if present
  if (req.body?.email && !validator.isEmail(req.body.email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format',
      error: 'INVALID_EMAIL_FORMAT' 
    });
  }

  // Validate URL format if present
  if (req.body?.url && !validator.isURL(req.body.url)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid URL format',
      error: 'INVALID_URL_FORMAT' 
    });
  }

  // Check for SQL injection patterns
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
    /((\%27)|(\'))union/gi
  ];

  const checkForSQLInjection = (value: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(value));
  };

  // Recursively check all string values in request body
  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForSQLInjection(obj);
    } else if (Array.isArray(obj)) {
      return obj.some(checkObject);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(checkObject);
    }
    return false;
  };

  if (req.body && checkObject(req.body)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid input detected',
      error: 'INVALID_INPUT' 
    });
  }

  next();
};

// CSRF Token Generation and Validation
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  private static readonly TOKEN_LIFETIME = 3600000; // 1 hour

  static generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + this.TOKEN_LIFETIME;
    
    this.tokens.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }

  static middleware(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for GET requests and authentication endpoints
    if (req.method === 'GET' || req.path.includes('/auth/signin') || req.path.includes('/auth/signup')) {
      return next();
    }

    const sessionId = req.headers['x-session-id'] as string;
    const csrfToken = req.headers['x-csrf-token'] as string;

    if (!sessionId || !csrfToken) {
      return res.status(403).json({ 
        success: false, 
        message: 'CSRF token required',
        error: 'CSRF_TOKEN_REQUIRED' 
      });
    }

    if (!CSRFProtection.validateToken(sessionId, csrfToken)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid CSRF token',
        error: 'INVALID_CSRF_TOKEN' 
      });
    }

    next();
  }

  private static cleanupExpiredTokens() {
    const now = Date.now();
    const entries = Array.from(this.tokens.entries());
    for (const [sessionId, data] of entries) {
      if (data.expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};