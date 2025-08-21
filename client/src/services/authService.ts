import { database } from '../config/database';
import { User, LoginRequest, JWTPayload, RefreshToken } from '../types';
import { UserService } from './userService';
import { PasswordService } from '../utils/password';
import { JWTService } from '../utils/jwt';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Authenticate user login
   */
  public static async login(loginData: LoginRequest): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Find user with password
      const userWithPassword = await UserService.findByEmailWithPassword(loginData.email);
      
      if (!userWithPassword) {
        throw new Error('Invalid email or password');
      }

      if (!userWithPassword.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await PasswordService.comparePassword(
        loginData.password,
        userWithPassword.password
      );

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Create JWT payload
      const jwtPayload: JWTPayload = {
        userId: userWithPassword.id,
        email: userWithPassword.email,
        role: userWithPassword.role,
      };

      // Generate tokens
      const accessToken = JWTService.generateAccessToken(jwtPayload);
      const refreshToken = JWTService.generateRefreshToken(jwtPayload);

      // Store refresh token in database
      await this.storeRefreshToken(userWithPassword.id, refreshToken);

      // Update last login
      await UserService.updateLastLogin(userWithPassword.id);

      // Remove password from user object
      const { password, ...user } = userWithPassword;

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  public static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const storedToken = await this.findRefreshToken(refreshToken);
      if (!storedToken) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        await this.deleteRefreshToken(refreshToken);
        throw new Error('Refresh token has expired');
      }

      // Get user
      const user = await UserService.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const newJwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = JWTService.generateAccessToken(newJwtPayload);
      const newRefreshToken = JWTService.generateRefreshToken(newJwtPayload);

      // Replace old refresh token with new one
      await this.deleteRefreshToken(refreshToken);
      await this.storeRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  public static async logout(refreshToken: string): Promise<void> {
    try {
      await this.deleteRefreshToken(refreshToken);
    } catch (error) {
      logger.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }

  /**
   * Logout from all devices (invalidate all refresh tokens for user)
   */
  public static async logoutAll(userId: number): Promise<void> {
    try {
      const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
      await database.query(query, [userId]);
    } catch (error) {
      logger.error('Logout all error:', error);
      throw new Error('Failed to logout from all devices');
    }
  }

  /**
   * Store refresh token in database
   */
  private static async storeRefreshToken(userId: number, token: string): Promise<void> {
    try {
      const expiresAt = JWTService.getTokenExpiration(token);
      
      if (!expiresAt) {
        throw new Error('Invalid token expiration');
      }

      const query = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `;

      await database.query(query, [userId, token, expiresAt]);
    } catch (error) {
      logger.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Find refresh token in database
   */
  private static async findRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      const query = `
        SELECT id, user_id, token, expires_at, created_at
        FROM refresh_tokens
        WHERE token = $1
      `;

      const result = await database.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const tokenData = result.rows[0];
      return {
        id: tokenData.id,
        userId: tokenData.user_id,
        token: tokenData.token,
        expiresAt: tokenData.expires_at,
        createdAt: tokenData.created_at,
      };
    } catch (error) {
      logger.error('Error finding refresh token:', error);
      throw new Error('Failed to find refresh token');
    }
  }

  /**
   * Delete refresh token from database
   */
  private static async deleteRefreshToken(token: string): Promise<void> {
    try {
      const query = 'DELETE FROM refresh_tokens WHERE token = $1';
      await database.query(query, [token]);
    } catch (error) {
      logger.error('Error deleting refresh token:', error);
      throw new Error('Failed to delete refresh token');
    }
  }

  /**
   * Clean up expired refresh tokens
   */
  public static async cleanupExpiredTokens(): Promise<void> {
    try {
      const query = 'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP';
      const result = await database.query(query);
      
      if (result.rowCount > 0) {
        logger.info(`Cleaned up ${result.rowCount} expired refresh tokens`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
    }
  }
}