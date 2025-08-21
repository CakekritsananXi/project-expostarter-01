
import { AuthService } from '../../client/src/services/authService';
import { UserService } from '../../client/src/services/userService';
import { PasswordService } from '../../client/src/utils/password';
import { JWTService } from '../../client/src/utils/jwt';
import { database } from '../../client/src/config/database';
import { logger } from '../../client/src/utils/logger';

// Mock dependencies
jest.mock('../../client/src/services/userService');
jest.mock('../../client/src/utils/password');
jest.mock('../../client/src/utils/jwt');
jest.mock('../../client/src/config/database');
jest.mock('../../client/src/utils/logger');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockPasswordService = PasswordService as jest.Mocked<typeof PasswordService>;
const mockJWTService = JWTService as jest.Mocked<typeof JWTService>;
const mockDatabase = database as jest.Mocked<typeof database>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUserWithPassword = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      emailVerified: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
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

    it('should login user successfully', async () => {
      // Arrange
      const mockAccessToken = 'accessToken123';
      const mockRefreshToken = 'refreshToken123';
      const mockExpirationDate = new Date('2023-01-02');

      mockUserService.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockJWTService.generateAccessToken.mockReturnValue(mockAccessToken);
      mockJWTService.generateRefreshToken.mockReturnValue(mockRefreshToken);
      mockJWTService.getTokenExpiration.mockReturnValue(mockExpirationDate);
      mockUserService.updateLastLogin.mockResolvedValue();
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await AuthService.login(mockLoginData);

      // Assert
      expect(mockUserService.findByEmailWithPassword).toHaveBeenCalledWith('test@example.com');
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockJWTService.generateAccessToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'test@example.com',
        role: 'user'
      });
      expect(mockJWTService.generateRefreshToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'test@example.com',
        role: 'user'
      });
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(1);
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe(mockAccessToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserService.findByEmailWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(mockLoginData))
        .rejects.toThrow('Invalid email or password');
      expect(mockLogger.error).toHaveBeenCalledWith('Login error:', expect.any(Error));
    });

    it('should throw error when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUserWithPassword, isActive: false };
      mockUserService.findByEmailWithPassword.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(AuthService.login(mockLoginData))
        .rejects.toThrow('Account is deactivated');
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      mockUserService.findByEmailWithPassword.mockResolvedValue(mockUserWithPassword);
      mockPasswordService.comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.login(mockLoginData))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'refreshToken123';
    const mockJWTPayload = {
      userId: 1,
      email: 'test@example.com',
      role: 'user'
    };

    const mockStoredToken = {
      id: 1,
      userId: 1,
      token: mockRefreshToken,
      expiresAt: new Date('2023-12-31'),
      createdAt: new Date('2023-01-01')
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

    it('should refresh token successfully', async () => {
      // Arrange
      const mockNewAccessToken = 'newAccessToken123';
      const mockNewRefreshToken = 'newRefreshToken123';
      const mockNewExpirationDate = new Date('2023-12-31');

      mockJWTService.verifyRefreshToken.mockReturnValue(mockJWTPayload);
      mockDatabase.query
        .mockResolvedValueOnce({ // findRefreshToken
          rows: [{ 
            id: 1, 
            user_id: 1, 
            token: mockRefreshToken, 
            expires_at: new Date('2023-12-31'), 
            created_at: new Date('2023-01-01') 
          }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({ // deleteRefreshToken
          rows: [],
          rowCount: 1,
          command: 'DELETE',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({ // storeRefreshToken
          rows: [],
          rowCount: 1,
          command: 'INSERT',
          oid: 0,
          fields: []
        });

      mockUserService.findById.mockResolvedValue(mockUser);
      mockJWTService.generateAccessToken.mockReturnValue(mockNewAccessToken);
      mockJWTService.generateRefreshToken.mockReturnValue(mockNewRefreshToken);
      mockJWTService.getTokenExpiration.mockReturnValue(mockNewExpirationDate);

      // Mock Date for expiration check
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-06-01').getTime());

      // Act
      const result = await AuthService.refreshToken(mockRefreshToken);

      // Assert
      expect(mockJWTService.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(result.accessToken).toBe(mockNewAccessToken);
      expect(result.refreshToken).toBe(mockNewRefreshToken);

      // Restore Date.now
      jest.spyOn(Date, 'now').mockRestore();
    });

    it('should throw error when refresh token not found in database', async () => {
      // Arrange
      mockJWTService.verifyRefreshToken.mockReturnValue(mockJWTPayload);
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act & Assert
      await expect(AuthService.refreshToken(mockRefreshToken))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw error when refresh token is expired', async () => {
      // Arrange
      const expiredToken = { ...mockStoredToken, expiresAt: new Date('2023-01-01') };
      mockJWTService.verifyRefreshToken.mockReturnValue(mockJWTPayload);
      mockDatabase.query
        .mockResolvedValueOnce({ // findRefreshToken
          rows: [{ 
            id: 1, 
            user_id: 1, 
            token: mockRefreshToken, 
            expires_at: new Date('2023-01-01'), 
            created_at: new Date('2023-01-01') 
          }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({ // deleteRefreshToken
          rows: [],
          rowCount: 1,
          command: 'DELETE',
          oid: 0,
          fields: []
        });

      // Mock current date to be after token expiration
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-06-01').getTime());
      jest.spyOn(global, 'Date').mockImplementation(() => new Date('2023-06-01'));

      // Act & Assert
      await expect(AuthService.refreshToken(mockRefreshToken))
        .rejects.toThrow('Refresh token has expired');

      // Restore mocks
      jest.restoreAllMocks();
    });

    it('should throw error when user not found or inactive', async () => {
      // Arrange
      mockJWTService.verifyRefreshToken.mockReturnValue(mockJWTPayload);
      mockDatabase.query.mockResolvedValue({
        rows: [{ 
          id: 1, 
          user_id: 1, 
          token: mockRefreshToken, 
          expires_at: new Date('2023-12-31'), 
          created_at: new Date('2023-01-01') 
        }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });
      mockUserService.findById.mockResolvedValue(null);

      // Mock Date for expiration check
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-06-01').getTime());

      // Act & Assert
      await expect(AuthService.refreshToken(mockRefreshToken))
        .rejects.toThrow('User not found or inactive');

      // Restore Date.now
      jest.spyOn(Date, 'now').mockRestore();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const mockRefreshToken = 'refreshToken123';
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'DELETE',
        oid: 0,
        fields: []
      });

      // Act
      await AuthService.logout(mockRefreshToken);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE token = $1',
        [mockRefreshToken]
      );
    });

    it('should handle logout error gracefully', async () => {
      // Arrange
      const mockRefreshToken = 'refreshToken123';
      const dbError = new Error('Database error');
      mockDatabase.query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(AuthService.logout(mockRefreshToken))
        .rejects.toThrow('Failed to logout');
      expect(mockLogger.error).toHaveBeenCalledWith('Logout error:', dbError);
    });
  });

  describe('logoutAll', () => {
    it('should logout user from all devices successfully', async () => {
      // Arrange
      const userId = 1;
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 2,
        command: 'DELETE',
        oid: 0,
        fields: []
      });

      // Act
      await AuthService.logoutAll(userId);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [userId]
      );
    });

    it('should handle logout all error gracefully', async () => {
      // Arrange
      const userId = 1;
      const dbError = new Error('Database error');
      mockDatabase.query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(AuthService.logoutAll(userId))
        .rejects.toThrow('Failed to logout from all devices');
      expect(mockLogger.error).toHaveBeenCalledWith('Logout all error:', dbError);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should cleanup expired tokens successfully', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 5,
        command: 'DELETE',
        oid: 0,
        fields: []
      });

      // Act
      await AuthService.cleanupExpiredTokens();

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Cleaned up 5 expired refresh tokens');
    });

    it('should handle cleanup with no expired tokens', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'DELETE',
        oid: 0,
        fields: []
      });

      // Act
      await AuthService.cleanupExpiredTokens();

      // Assert
      expect(mockDatabase.query).toHaveBeenCalled();
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle cleanup error gracefully', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDatabase.query.mockRejectedValue(dbError);

      // Act
      await AuthService.cleanupExpiredTokens();

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith('Error cleaning up expired tokens:', dbError);
    });
  });
});
