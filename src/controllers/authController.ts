import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { CreateUserRequest, LoginRequest, ApiResponse, AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   * @route POST /api/v1/auth/register
   */
  public static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      // Create user
      const user = await UserService.create(userData);

      // Log the user in immediately after registration
      const loginResult = await AuthService.login({
        email: userData.email,
        password: userData.password,
      });

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: loginResult.user,
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
        },
      };

      logger.info(`New user registered: ${user.email}`);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  public static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;

      const result = await AuthService.login(loginData);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      logger.info(`User logged in: ${result.user.email}`);
      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            error: 'INVALID_CREDENTIALS',
          });
          return;
        } else if (error.message.includes('deactivated')) {
          res.status(401).json({
            success: false,
            message: 'Account is deactivated',
            error: 'ACCOUNT_DEACTIVATED',
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Refresh access token
   * @route POST /api/v1/auth/refresh
   */
  public static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          error: 'MISSING_REFRESH_TOKEN',
        });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
          res.status(401).json({
            success: false,
            message: error.message,
            error: 'INVALID_REFRESH_TOKEN',
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Logout user
   * @route POST /api/v1/auth/logout
   */
  public static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all devices
   * @route POST /api/v1/auth/logout-all
   */
  public static async logoutAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED',
        });
        return;
      }

      await AuthService.logoutAll(req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out from all devices successfully',
      };

      logger.info(`User logged out from all devices: ${req.user.email}`);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * @route GET /api/v1/auth/me
   */
  public static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: req.user },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}