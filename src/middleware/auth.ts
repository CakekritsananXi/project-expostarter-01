import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { UserService } from '../services/userService';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN',
      });
      return;
    }

    // Verify the token
    const payload = JWTService.verifyAccessToken(token);

    // Get user from database
    const user = await UserService.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is deactivated',
        error: 'ACCOUNT_DEACTIVATED',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: 'Access token has expired',
          error: 'TOKEN_EXPIRED',
        });
        return;
      } else if (error.message.includes('invalid')) {
        res.status(401).json({
          success: false,
          message: 'Invalid access token',
          error: 'INVALID_TOKEN',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: 'AUTHENTICATION_ERROR',
    });
  }
};

/**
 * Middleware to authorize user roles
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = JWTService.verifyAccessToken(token);
      const user = await UserService.findById(payload.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    logger.debug('Optional auth failed:', error);
    next();
  }
};