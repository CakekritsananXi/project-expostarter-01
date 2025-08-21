
import { Response, NextFunction } from 'express';
import { authenticateToken, authorizeRoles, optionalAuth } from '../../client/src/middleware/auth';
import { JWTService } from '../../client/src/utils/jwt';
import { UserService } from '../../client/src/services/userService';
import { logger } from '../../client/src/utils/logger';
import { AuthenticatedRequest } from '../../client/src/types';

// Mock dependencies
jest.mock('../../client/src/utils/jwt');
jest.mock('../../client/src/services/userService');
jest.mock('../../client/src/utils/logger');

const mockJWTService = JWTService as jest.Mocked<typeof JWTService>;
const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
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

    const mockJWTPayload = {
      userId: 1,
      email: 'test@example.com',
      role: 'user'
    };

    it('should authenticate valid token successfully', async () => {
      // Arrange
      const mockToken = 'validToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockReturnValue(mockJWTPayload);
      mockUserService.findById.mockResolvedValue(mockUser);

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockJWTService.extractTokenFromHeader).toHaveBeenCalledWith(`Bearer ${mockToken}`);
      expect(mockJWTService.verifyAccessToken).toHaveBeenCalledWith(mockToken);
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token provided', async () => {
      // Arrange
      mockJWTService.extractTokenFromHeader.mockReturnValue(null);

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    });

    it('should return 401 when user not found', async () => {
      // Arrange
      const mockToken = 'validToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockReturnValue(mockJWTPayload);
      mockUserService.findById.mockResolvedValue(null);

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    });

    it('should return 401 when user is inactive', async () => {
      // Arrange
      const mockToken = 'validToken123';
      const inactiveUser = { ...mockUser, isActive: false };
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockReturnValue(mockJWTPayload);
      mockUserService.findById.mockResolvedValue(inactiveUser);

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User account is deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      });
    });

    it('should return 401 when token is expired', async () => {
      // Arrange
      const mockToken = 'expiredToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      const expiredError = new Error('Token has expired');
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw expiredError;
      });

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token has expired',
        error: 'TOKEN_EXPIRED'
      });
      expect(mockLogger.error).toHaveBeenCalledWith('Authentication error:', expiredError);
    });

    it('should return 401 when token is invalid', async () => {
      // Arrange
      const mockToken = 'invalidToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      const invalidError = new Error('Token is invalid');
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw invalidError;
      });

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid access token',
        error: 'INVALID_TOKEN'
      });
    });

    it('should return 500 for unexpected errors', async () => {
      // Arrange
      const mockToken = 'validToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      const unexpectedError = new Error('Database connection failed');
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw unexpectedError;
      });

      // Act
      await authenticateToken(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication failed',
        error: 'AUTHENTICATION_ERROR'
      });
    });
  });

  describe('authorizeRoles', () => {
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

    it('should authorize user with correct role', () => {
      // Arrange
      const middleware = authorizeRoles('user', 'admin');
      mockReq.user = mockUser;

      // Act
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should authorize admin user', () => {
      // Arrange
      const middleware = authorizeRoles('admin');
      const adminUser = { ...mockUser, role: 'admin' };
      mockReq.user = adminUser;

      // Act
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      // Arrange
      const middleware = authorizeRoles('admin');
      mockReq.user = undefined;

      // Act
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    });

    it('should return 403 when user lacks required role', () => {
      // Arrange
      const middleware = authorizeRoles('admin');
      mockReq.user = mockUser; // user role, but admin required

      // Act
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    });

    it('should authorize user with one of multiple allowed roles', () => {
      // Arrange
      const middleware = authorizeRoles('admin', 'editor', 'user');
      const editorUser = { ...mockUser, role: 'editor' };
      mockReq.user = editorUser;

      // Act
      middleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
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

    const mockJWTPayload = {
      userId: 1,
      email: 'test@example.com',
      role: 'user'
    };

    it('should authenticate valid token and set user', async () => {
      // Arrange
      const mockToken = 'validToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockReturnValue(mockJWTPayload);
      mockUserService.findById.mockResolvedValue(mockUser);

      // Act
      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when no token provided', async () => {
      // Arrange
      mockJWTService.extractTokenFromHeader.mockReturnValue(null);

      // Act
      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', async () => {
      // Arrange
      const mockToken = 'invalidToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      const invalidError = new Error('Invalid token');
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockImplementation(() => {
        throw invalidError;
      });

      // Act
      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Optional auth failed:', invalidError);
    });

    it('should continue without user when user not found', async () => {
      // Arrange
      const mockToken = 'validToken123';
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockReturnValue(mockJWTPayload);
      mockUserService.findById.mockResolvedValue(null);

      // Act
      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when user is inactive', async () => {
      // Arrange
      const mockToken = 'validToken123';
      const inactiveUser = { ...mockUser, isActive: false };
      mockReq.headers = { authorization: `Bearer ${mockToken}` };
      
      mockJWTService.extractTokenFromHeader.mockReturnValue(mockToken);
      mockJWTService.verifyAccessToken.mockReturnValue(mockJWTPayload);
      mockUserService.findById.mockResolvedValue(inactiveUser);

      // Act
      await optionalAuth(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      // Assert
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
