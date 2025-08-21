
import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../client/src/controllers/authController';
import { AuthService } from '../../client/src/services/authService';
import { UserService } from '../../client/src/services/userService';
import { logger } from '../../client/src/utils/logger';
import { AuthenticatedRequest } from '../../client/src/types';

// Mock dependencies
jest.mock('../../client/src/services/authService');
jest.mock('../../client/src/services/userService');
jest.mock('../../client/src/utils/logger');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('AuthController', () => {
  let mockReq: Partial<Request | AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      emailVerified: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    };

    const mockLoginResult = {
      user: mockUser,
      accessToken: 'accessToken123',
      refreshToken: 'refreshToken123'
    };

    it('should register user successfully', async () => {
      // Arrange
      mockReq.body = mockUserData;
      mockUserService.create.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      // Act
      await AuthController.register(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockUserService.create).toHaveBeenCalledWith(mockUserData);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: mockUserData.password
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockLoginResult
      });
      expect(mockLogger.info).toHaveBeenCalledWith(`New user registered: ${mockUser.email}`);
    });

    it('should call next with error on registration failure', async () => {
      // Arrange
      mockReq.body = mockUserData;
      const error = new Error('Registration failed');
      mockUserService.create.mockRejectedValue(error);

      // Act
      await AuthController.register(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockLoginResult = {
      user: mockUser,
      accessToken: 'accessToken123',
      refreshToken: 'refreshToken123'
    };

    it('should login user successfully', async () => {
      // Arrange
      mockReq.body = mockLoginData;
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      // Act
      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginData);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: mockLoginResult
      });
      expect(mockLogger.info).toHaveBeenCalledWith(`User logged in: ${mockUser.email}`);
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      mockReq.body = mockLoginData;
      const error = new Error('Invalid email or password');
      mockAuthService.login.mockRejectedValue(error);

      // Act
      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    });

    it('should return 401 for deactivated account', async () => {
      // Arrange
      mockReq.body = mockLoginData;
      const error = new Error('Account is deactivated');
      mockAuthService.login.mockRejectedValue(error);

      // Act
      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    });

    it('should call next for other errors', async () => {
      // Arrange
      mockReq.body = mockLoginData;
      const error = new Error('Database connection failed');
      mockAuthService.login.mockRejectedValue(error);

      // Act
      await AuthController.login(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'refreshToken123';
    const mockTokenResult = {
      accessToken: 'newAccessToken123',
      refreshToken: 'newRefreshToken123'
    };

    it('should refresh token successfully', async () => {
      // Arrange
      mockReq.body = { refreshToken: mockRefreshToken };
      mockAuthService.refreshToken.mockResolvedValue(mockTokenResult);

      // Act
      await AuthController.refreshToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed successfully',
        data: mockTokenResult
      });
    });

    it('should return 400 when refresh token is missing', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await AuthController.refreshToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      // Arrange
      mockReq.body = { refreshToken: mockRefreshToken };
      const error = new Error('Invalid refresh token');
      mockAuthService.refreshToken.mockRejectedValue(error);

      // Act
      await AuthController.refreshToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
    });

    it('should return 401 for expired refresh token', async () => {
      // Arrange
      mockReq.body = { refreshToken: mockRefreshToken };
      const error = new Error('Refresh token has expired');
      mockAuthService.refreshToken.mockRejectedValue(error);

      // Act
      await AuthController.refreshToken(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token has expired',
        error: 'INVALID_REFRESH_TOKEN'
      });
    });
  });

  describe('logout', () => {
    const mockRefreshToken = 'refreshToken123';

    it('should logout user successfully', async () => {
      // Arrange
      mockReq.body = { refreshToken: mockRefreshToken };
      mockAuthService.logout.mockResolvedValue();

      // Act
      await AuthController.logout(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful'
      });
    });

    it('should logout successfully even without refresh token', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await AuthController.logout(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful'
      });
    });

    it('should call next on error', async () => {
      // Arrange
      mockReq.body = { refreshToken: mockRefreshToken };
      const error = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValue(error);

      // Act
      await AuthController.logout(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logoutAll', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      emailVerified: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    };

    it('should logout user from all devices successfully', async () => {
      // Arrange
      const mockAuthReq = mockReq as AuthenticatedRequest;
      mockAuthReq.user = mockUser;
      mockAuthService.logoutAll.mockResolvedValue();

      // Act
      await AuthController.logoutAll(mockAuthReq, mockRes as Response, mockNext);

      // Assert
      expect(mockAuthService.logoutAll).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out from all devices successfully'
      });
      expect(mockLogger.info).toHaveBeenCalledWith(`User logged out from all devices: ${mockUser.email}`);
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const mockAuthReq = mockReq as AuthenticatedRequest;
      mockAuthReq.user = undefined;

      // Act
      await AuthController.logoutAll(mockAuthReq, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      emailVerified: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    };

    it('should get user profile successfully', async () => {
      // Arrange
      const mockAuthReq = mockReq as AuthenticatedRequest;
      mockAuthReq.user = mockUser;

      // Act
      await AuthController.getProfile(mockAuthReq, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: mockUser }
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const mockAuthReq = mockReq as AuthenticatedRequest;
      mockAuthReq.user = undefined;

      // Act
      await AuthController.getProfile(mockAuthReq, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    });
  });
});
