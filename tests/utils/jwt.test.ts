
import jwt from 'jsonwebtoken';
import { JWTService } from '../../client/src/utils/jwt';
import { JWTPayload } from '../../client/src/types';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock environment variables
const originalEnv = process.env;

describe('JWTService', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-key';
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const mockPayload: JWTPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'user'
  };

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload and options', () => {
      // Arrange
      const expectedToken = 'generated-access-token';
      mockJwt.sign.mockReturnValue(expectedToken);

      // Act
      const result = JWTService.generateAccessToken(mockPayload);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        'test-secret-key',
        { expiresIn: '15m' }
      );
      expect(result).toBe(expectedToken);
    });

    it('should handle string return from jwt.sign', () => {
      // Arrange
      const expectedToken = 'string-token';
      mockJwt.sign.mockReturnValue(expectedToken);

      // Act
      const result = JWTService.generateAccessToken(mockPayload);

      // Assert
      expect(result).toBe(expectedToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload and options', () => {
      // Arrange
      const expectedToken = 'generated-refresh-token';
      mockJwt.sign.mockReturnValue(expectedToken);

      // Act
      const result = JWTService.generateRefreshToken(mockPayload);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        'test-secret-key',
        { expiresIn: '7d' }
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      // Arrange
      const token = 'valid-access-token';
      const expectedPayload = { ...mockPayload, iat: 1234567890, exp: 1234567890 };
      mockJwt.verify.mockReturnValue(expectedPayload);

      // Act
      const result = JWTService.verifyAccessToken(token);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const token = 'invalid-token';
      const jwtError = new Error('Invalid token');
      mockJwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      expect(() => JWTService.verifyAccessToken(token)).toThrow('Invalid token');
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
    });

    it('should throw error for expired token', () => {
      // Arrange
      const token = 'expired-token';
      const expiredError = new (jwt.TokenExpiredError as any)('Token expired', new Date());
      mockJwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      // Act & Assert
      expect(() => JWTService.verifyAccessToken(token)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      // Arrange
      const token = 'valid-refresh-token';
      const expectedPayload = { ...mockPayload, iat: 1234567890, exp: 1234567890 };
      mockJwt.verify.mockReturnValue(expectedPayload);

      // Act
      const result = JWTService.verifyRefreshToken(token);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid refresh token', () => {
      // Arrange
      const token = 'invalid-refresh-token';
      const jwtError = new Error('Invalid refresh token');
      mockJwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act & Assert
      expect(() => JWTService.verifyRefreshToken(token)).toThrow('Invalid refresh token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      // Arrange
      const authHeader = 'Bearer valid-token-123';

      // Act
      const result = JWTService.extractTokenFromHeader(authHeader);

      // Assert
      expect(result).toBe('valid-token-123');
    });

    it('should return null for missing header', () => {
      // Act
      const result = JWTService.extractTokenFromHeader(undefined);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid header format', () => {
      // Arrange
      const invalidHeaders = [
        'InvalidFormat token-123',
        'Bearer',
        'token-123',
        '',
        'Basic dXNlcjpwYXNz'
      ];

      // Act & Assert
      invalidHeaders.forEach(header => {
        const result = JWTService.extractTokenFromHeader(header);
        expect(result).toBeNull();
      });
    });

    it('should handle header with extra spaces', () => {
      // Arrange
      const authHeader = '  Bearer   token-with-spaces  ';

      // Act
      const result = JWTService.extractTokenFromHeader(authHeader);

      // Assert
      expect(result).toBe('token-with-spaces');
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', () => {
      // Arrange
      const token = 'valid-token';
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const decodedPayload = { ...mockPayload, exp, iat: Math.floor(Date.now() / 1000) };
      mockJwt.decode.mockReturnValue(decodedPayload);

      // Act
      const result = JWTService.getTokenExpiration(token);

      // Assert
      expect(mockJwt.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual(new Date(exp * 1000));
    });

    it('should return null for token without expiration', () => {
      // Arrange
      const token = 'token-without-exp';
      const decodedPayload = { ...mockPayload, iat: Math.floor(Date.now() / 1000) };
      mockJwt.decode.mockReturnValue(decodedPayload);

      // Act
      const result = JWTService.getTokenExpiration(token);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid token', () => {
      // Arrange
      const token = 'invalid-token';
      mockJwt.decode.mockReturnValue(null);

      // Act
      const result = JWTService.getTokenExpiration(token);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for non-object decoded payload', () => {
      // Arrange
      const token = 'string-payload-token';
      mockJwt.decode.mockReturnValue('string-payload');

      // Act
      const result = JWTService.getTokenExpiration(token);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing JWT_SECRET environment variable', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      
      // Mock console.error to avoid test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act & Assert - This would typically cause issues in the actual implementation
      // The test verifies that the service handles missing secrets gracefully
      expect(() => {
        // Reset modules to re-import with new env
        jest.resetModules();
        require('../../client/src/utils/jwt');
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle jwt.sign throwing an error', () => {
      // Arrange
      const signError = new Error('Signing failed');
      mockJwt.sign.mockImplementation(() => {
        throw signError;
      });

      // Act & Assert
      expect(() => JWTService.generateAccessToken(mockPayload)).toThrow('Signing failed');
    });

    it('should handle malformed JWT payload in verification', () => {
      // Arrange
      const token = 'malformed-token';
      const malformedPayload = { userId: 'not-a-number', email: 123, role: null };
      mockJwt.verify.mockReturnValue(malformedPayload);

      // Act
      const result = JWTService.verifyAccessToken(token);

      // Assert - Should extract valid fields and handle invalid ones
      expect(result.userId).toBe('not-a-number'); // Type conversion handled by TypeScript
      expect(result.email).toBe(123);
      expect(result.role).toBe(null);
    });
  });
});
