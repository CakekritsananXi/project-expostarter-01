import { database } from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest, PaginatedResponse, PaginationQuery } from '../types';
import { PasswordService } from '../utils/password';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Create a new user
   */
  public static async create(userData: CreateUserRequest): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await PasswordService.hashPassword(userData.password);

      const query = `
        INSERT INTO users (email, password, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at
      `;

      const values = [
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
      ];

      const result = await database.query(query, values);
      const user = result.rows[0];

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      
      // Handle unique constraint violation (duplicate email)
      if ((error as any).code === '23505') {
        throw new Error('Email address is already registered');
      }
      
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  public static async findById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, first_name, last_name, role, is_active, email_verified, last_login, created_at, updated_at
        FROM users
        WHERE id = $1 AND is_active = true
      `;

      const result = await database.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by email
   */
  public static async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, first_name, last_name, role, is_active, email_verified, last_login, created_at, updated_at
        FROM users
        WHERE email = $1
      `;

      const result = await database.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by email with password (for authentication)
   */
  public static async findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    try {
      const query = `
        SELECT id, email, password, first_name, last_name, role, is_active, email_verified, last_login, created_at, updated_at
        FROM users
        WHERE email = $1
      `;

      const result = await database.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error finding user by email with password:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Update user
   */
  public static async update(id: number, userData: UpdateUserRequest): Promise<User | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (userData.firstName !== undefined) {
        updateFields.push(`first_name = $${paramCount}`);
        values.push(userData.firstName);
        paramCount++;
      }

      if (userData.lastName !== undefined) {
        updateFields.push(`last_name = $${paramCount}`);
        values.push(userData.lastName);
        paramCount++;
      }

      if (userData.email !== undefined) {
        updateFields.push(`email = $${paramCount}`);
        values.push(userData.email);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);

      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING id, email, first_name, last_name, role, is_active, email_verified, last_login, created_at, updated_at
      `;

      const result = await database.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      
      // Handle unique constraint violation (duplicate email)
      if ((error as any).code === '23505') {
        throw new Error('Email address is already in use');
      }
      
      throw new Error('Failed to update user');
    }
  }

  /**
   * Update user's last login timestamp
   */
  public static async updateLastLogin(id: number): Promise<void> {
    try {
      const query = `
        UPDATE users
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      await database.query(query, [id]);
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Soft delete user (deactivate)
   */
  public static async deactivate(id: number): Promise<boolean> {
    try {
      const query = `
        UPDATE users
        SET is_active = false
        WHERE id = $1 AND is_active = true
      `;

      const result = await database.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Get paginated users
   */
  public static async findAll(options: PaginationQuery = {}): Promise<PaginatedResponse<User>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      const offset = (page - 1) * limit;

      // Count total users
      const countQuery = 'SELECT COUNT(*) FROM users WHERE is_active = true';
      const countResult = await database.query(countQuery);
      const total = parseInt(countResult.rows[0].count);

      // Get users
      const query = `
        SELECT id, email, first_name, last_name, role, is_active, email_verified, last_login, created_at, updated_at
        FROM users
        WHERE is_active = true
        ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
        LIMIT $1 OFFSET $2
      `;

      const result = await database.query(query, [limit, offset]);

      const users: User[] = result.rows.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw new Error('Failed to retrieve users');
    }
  }
}