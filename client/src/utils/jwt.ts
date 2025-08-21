import jwt, { Secret, SignOptions } from 'jsonwebtoken'; // Import Secret and SignOptions
import { config } from '../config/environment';
import { JWTPayload } from '../types';
import { logger } from './logger';

export class JWTService {
  /**
   * Generate access token
   */
  public static generateAccessToken(payload: JWTPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: config.jwt.expiresIn,
        issuer: 'contentflow-api',
        audience: 'contentflow-client',
      };
      return jwt.sign(payload, config.jwt.secret as Secret, options);
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token
   */
  public static generateRefreshToken(payload: JWTPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'contentflow-api',
        audience: 'contentflow-client',
      };
      return jwt.sign(payload, config.jwt.refreshSecret as Secret, options);
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Verify access token
   */
  public static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret as Secret, {
        issuer: 'contentflow-api',
        audience: 'contentflow-client',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        logger.error('Error verifying access token:', error);
        throw new Error('Failed to verify access token');
      }
    }
  }

  /**
   * Verify refresh token
   */
  public static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret as Secret, {
        issuer: 'contentflow-api',
        audience: 'contentflow-client',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Error verifying refresh token:', error);
        throw new Error('Failed to verify refresh token');
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  public static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Get token expiration date
   */
  public static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }
}