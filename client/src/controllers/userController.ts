import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserRequest, ApiResponse, AuthenticatedRequest, PaginationQuery } from '../types';
import { logger } from '../utils/logger';

export class UserController {
  /**
   * Get all users (paginated)
   * @route GET /api/v1/users
   */
  public static async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const options: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await UserService.findAll(options);

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * @route GET /api/v1/users/:id
   */
  public static async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserService.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: { user },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * @route PUT /api/v1/users/:id
   */
  public static async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const updateData: UpdateUserRequest = req.body;

      // Check if user is updating their own profile or has admin privileges
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED',
        });
        return;
      }

      if (req.user.id !== userId && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You can only update your own profile',
          error: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }

      const updatedUser = await UserService.update(userId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      };

      logger.info(`User updated: ${updatedUser.email}`);
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already in use')) {
        res.status(409).json({
          success: false,
          message: 'Email address is already in use',
          error: 'EMAIL_ALREADY_EXISTS',
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Deactivate user account
   * @route DELETE /api/v1/users/:id
   */
  public static async deactivateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      // Check if user is deactivating their own account or has admin privileges
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'NOT_AUTHENTICATED',
        });
        return;
      }

      if (req.user.id !== userId && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'You can only deactivate your own account',
          error: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }

      const success = await UserService.deactivate(userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'User not found or already deactivated',
          error: 'USER_NOT_FOUND',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User account deactivated successfully',
      };

      logger.info(`User deactivated: ${req.user.email}`);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's profile
   * @route GET /api/v1/users/me
   */
  public static async getCurrentUser(
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
        message: 'Current user retrieved successfully',
        data: { user: req.user },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user's profile
   * @route PUT /api/v1/users/me
   */
  public static async updateCurrentUser(
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

      const updateData: UpdateUserRequest = req.body;
      const updatedUser = await UserService.update(req.user.id, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      };

      logger.info(`User profile updated: ${updatedUser.email}`);
      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already in use')) {
        res.status(409).json({
          success: false,
          message: 'Email address is already in use',
          error: 'EMAIL_ALREADY_EXISTS',
        });
        return;
      }
      next(error);
    }
  }
}