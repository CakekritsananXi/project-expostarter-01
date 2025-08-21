
import { UserService } from '../../client/src/services/userService';
import { database } from '../../client/src/config/database';
import { PasswordService } from '../../client/src/utils/password';
import { logger } from '../../client/src/utils/logger';

// Mock dependencies
jest.mock('../../client/src/config/database');
jest.mock('../../client/src/utils/password');
jest.mock('../../client/src/utils/logger');

const mockDatabase = database as jest.Mocked<typeof database>;
const mockPasswordService = PasswordService as jest.Mocked<typeof PasswordService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockHashedPassword = 'hashedPassword123';
    const mockUserRow = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      email_verified: false,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01')
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockPasswordService.hashPassword.mockResolvedValue(mockHashedPassword);
      mockDatabase.query.mockResolvedValue({
        rows: [mockUserRow],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.create(mockUserData);

      // Assert
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['test@example.com', mockHashedPassword, 'John', 'Doe']
      );
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      });
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      mockPasswordService.hashPassword.mockResolvedValue(mockHashedPassword);
      const duplicateEmailError = new Error('Duplicate key') as any;
      duplicateEmailError.code = '23505';
      mockDatabase.query.mockRejectedValue(duplicateEmailError);

      // Act & Assert
      await expect(UserService.create(mockUserData))
        .rejects.toThrow('Email address is already registered');
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating user:', duplicateEmailError);
    });

    it('should throw generic error for database failure', async () => {
      // Arrange
      mockPasswordService.hashPassword.mockResolvedValue(mockHashedPassword);
      const dbError = new Error('Database connection failed');
      mockDatabase.query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(UserService.create(mockUserData))
        .rejects.toThrow('Failed to create user');
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating user:', dbError);
    });
  });

  describe('findById', () => {
    const mockUserRow = {
      id: 1,
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      email_verified: false,
      last_login: new Date('2023-01-01'),
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01')
    };

    it('should return user when found', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [mockUserRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.findById(1);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        emailVerified: false,
        lastLogin: new Date('2023-01-01'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.findById(999);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      // Arrange
      const dbError = new Error('Database error');
      mockDatabase.query.mockRejectedValue(dbError);

      // Act & Assert
      await expect(UserService.findById(1))
        .rejects.toThrow('Failed to find user');
      expect(mockLogger.error).toHaveBeenCalledWith('Error finding user by ID:', dbError);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      // Arrange
      const mockUserRow = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: true,
        email_verified: false,
        last_login: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      };

      mockDatabase.query.mockResolvedValue({
        rows: [mockUserRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.findByEmail('test@example.com');

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        ['test@example.com']
      );
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    };

    it('should update user successfully', async () => {
      // Arrange
      const mockUpdatedUser = {
        id: 1,
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'user',
        is_active: true,
        email_verified: false,
        last_login: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02')
      };

      mockDatabase.query.mockResolvedValue({
        rows: [mockUpdatedUser],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.update(1, updateData);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        expect.arrayContaining(['Jane', 'Smith', 'jane.smith@example.com', 1])
      );
      expect(result?.firstName).toBe('Jane');
      expect(result?.lastName).toBe('Smith');
      expect(result?.email).toBe('jane.smith@example.com');
    });

    it('should throw error when no fields to update', async () => {
      // Act & Assert
      await expect(UserService.update(1, {}))
        .rejects.toThrow('No fields to update');
    });

    it('should return null when user not found for update', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.update(999, updateData);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error for duplicate email on update', async () => {
      // Arrange
      const duplicateEmailError = new Error('Duplicate key') as any;
      duplicateEmailError.code = '23505';
      mockDatabase.query.mockRejectedValue(duplicateEmailError);

      // Act & Assert
      await expect(UserService.update(1, updateData))
        .rejects.toThrow('Email address is already in use');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user successfully', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.deactivate(1);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET is_active = false'),
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false when user not found or already deactivated', async () => {
      // Arrange
      mockDatabase.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.deactivate(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with default options', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          first_name: 'User',
          last_name: 'One',
          role: 'user',
          is_active: true,
          email_verified: false,
          last_login: null,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01')
        }
      ];

      // Mock count query
      mockDatabase.query.mockResolvedValueOnce({
        rows: [{ count: '1' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Mock users query
      mockDatabase.query.mockResolvedValueOnce({
        rows: mockUsers,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.findAll();

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should handle custom pagination options', async () => {
      // Arrange
      const options = {
        page: 2,
        limit: 5,
        sortBy: 'email',
        sortOrder: 'asc' as const
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [{ count: '15' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      mockDatabase.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      // Act
      const result = await UserService.findAll(options);

      // Assert
      expect(mockDatabase.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('ORDER BY email ASC'),
        [5, 5] // limit, offset
      );
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });
});
