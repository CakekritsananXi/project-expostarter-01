
import bcrypt from 'bcrypt';
import { PasswordService } from '../../client/src/utils/password';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('PasswordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      // Arrange
      const password = 'plainPassword123';
      const expectedHash = 'hashedPassword123';
      const saltRounds = 12;

      mockBcrypt.hash.mockResolvedValue(expectedHash);

      // Act
      const result = await PasswordService.hashPassword(password);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
      expect(result).toBe(expectedHash);
    });

    it('should handle empty password', async () => {
      // Arrange
      const password = '';
      const expectedHash = 'hashedEmptyPassword';

      mockBcrypt.hash.mockResolvedValue(expectedHash);

      // Act
      const result = await PasswordService.hashPassword(password);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith('', 12);
      expect(result).toBe(expectedHash);
    });

    it('should handle very long password', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);
      const expectedHash = 'hashedLongPassword';

      mockBcrypt.hash.mockResolvedValue(expectedHash);

      // Act
      const result = await PasswordService.hashPassword(longPassword);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith(longPassword, 12);
      expect(result).toBe(expectedHash);
    });

    it('should handle special characters in password', async () => {
      // Arrange
      const specialPassword = 'p@ssW0rd!#$%^&*()';
      const expectedHash = 'hashedSpecialPassword';

      mockBcrypt.hash.mockResolvedValue(expectedHash);

      // Act
      const result = await PasswordService.hashPassword(specialPassword);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith(specialPassword, 12);
      expect(result).toBe(expectedHash);
    });

    it('should throw error when bcrypt.hash fails', async () => {
      // Arrange
      const password = 'failingPassword';
      const bcryptError = new Error('Bcrypt hashing failed');

      mockBcrypt.hash.mockRejectedValue(bcryptError);

      // Act & Assert
      await expect(PasswordService.hashPassword(password))
        .rejects.toThrow('Bcrypt hashing failed');
    });

    it('should handle unicode characters in password', async () => {
      // Arrange
      const unicodePassword = '密码123🔒';
      const expectedHash = 'hashedUnicodePassword';

      mockBcrypt.hash.mockResolvedValue(expectedHash);

      // Act
      const result = await PasswordService.hashPassword(unicodePassword);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith(unicodePassword, 12);
      expect(result).toBe(expectedHash);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const plainPassword = 'correctPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const plainPassword = 'wrongPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty plain password', async () => {
      // Arrange
      const plainPassword = '';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith('', hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty hashed password', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = '';

      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, '');
      expect(result).toBe(false);
    });

    it('should handle both empty passwords', async () => {
      // Arrange
      const plainPassword = '';
      const hashedPassword = '';

      mockBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith('', '');
      expect(result).toBe(true);
    });

    it('should handle special characters in passwords', async () => {
      // Arrange
      const plainPassword = 'p@ssW0rd!#$%^&*()';
      const hashedPassword = '$2b$12$hashedSpecialPassword';

      mockBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should handle unicode characters in passwords', async () => {
      // Arrange
      const plainPassword = '密码123🔒';
      const hashedPassword = '$2b$12$hashedUnicodePassword';

      mockBcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await PasswordService.comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should throw error when bcrypt.compare fails', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = 'hashedPassword123';
      const bcryptError = new Error('Bcrypt comparison failed');

      mockBcrypt.compare.mockRejectedValue(bcryptError);

      // Act & Assert
      await expect(PasswordService.comparePassword(plainPassword, hashedPassword))
        .rejects.toThrow('Bcrypt comparison failed');
    });

    it('should handle malformed hash', async () => {
      // Arrange
      const plainPassword = 'password123';
      const malformedHash = 'not-a-valid-bcrypt-hash';
      const bcryptError = new Error('Invalid hash format');

      mockBcrypt.compare.mockRejectedValue(bcryptError);

      // Act & Assert
      await expect(PasswordService.comparePassword(plainPassword, malformedHash))
        .rejects.toThrow('Invalid hash format');
    });

    it('should handle very long passwords', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);
      const hashedPassword = '$2b$12$hashedLongPassword';

      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordService.comparePassword(longPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(longPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should hash and compare password successfully', async () => {
      // This test simulates the real workflow but still uses mocks
      // Arrange
      const originalPassword = 'testPassword123';
      const hashedPassword = '$2b$12$mockedHashedPassword';

      // Mock the hash process
      mockBcrypt.hash.mockResolvedValue(hashedPassword);
      
      // Mock the compare process
      mockBcrypt.compare.mockResolvedValue(true);

      // Act
      const hash = await PasswordService.hashPassword(originalPassword);
      const isMatch = await PasswordService.comparePassword(originalPassword, hash);

      // Assert
      expect(hash).toBe(hashedPassword);
      expect(isMatch).toBe(true);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(originalPassword, 12);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(originalPassword, hashedPassword);
    });

    it('should fail comparison with wrong password', async () => {
      // Arrange
      const correctPassword = 'correctPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = '$2b$12$mockedHashedPassword';

      mockBcrypt.hash.mockResolvedValue(hashedPassword);
      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const hash = await PasswordService.hashPassword(correctPassword);
      const isMatch = await PasswordService.comparePassword(wrongPassword, hash);

      // Assert
      expect(hash).toBe(hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('performance and edge cases', () => {
    it('should handle null password gracefully', async () => {
      // Arrange
      const nullPassword = null as any;
      const hashedPassword = '$2b$12$hashedPassword';

      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordService.comparePassword(nullPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(null, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle undefined password gracefully', async () => {
      // Arrange
      const undefinedPassword = undefined as any;
      const hashedPassword = '$2b$12$hashedPassword';

      mockBcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await PasswordService.comparePassword(undefinedPassword, hashedPassword);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(undefined, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
