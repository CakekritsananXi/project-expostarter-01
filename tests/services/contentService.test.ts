
import { ContentService, CreateContentData, UpdateContentData } from '../../client/src/services/contentService';
import { database } from '../../client/src/config/database';
import { logger } from '../../client/src/utils/logger';

// Mock dependencies
jest.mock('../../client/src/config/database');
jest.mock('../../client/src/utils/logger');

const mockDatabase = database as jest.Mocked<typeof database>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('ContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create content successfully with all fields', async () => {
      // Arrange
      const userId = 1;
      const createData: CreateContentData = {
        title: 'Test Blog Post',
        content: 'This is test content',
        type: 'blog',
        status: 'draft',
        scheduledDate: new Date('2024-12-25T10:00:00Z')
      };

      const mockRow = {
        id: 1,
        title: 'Test Blog Post',
        content: 'This is test content',
        type: 'blog',
        status: 'draft',
        scheduled_date: '2024-12-25T10:00:00Z',
        published_date: null,
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1
      } as any);

      // Act
      const result = await ContentService.create(userId, createData);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO content_items'),
        [
          'Test Blog Post',
          'This is test content', 
          'blog',
          'draft',
          createData.scheduledDate,
          1
        ]
      );

      expect(result).toEqual({
        id: 1,
        title: 'Test Blog Post',
        content: 'This is test content',
        type: 'blog',
        status: 'draft',
        scheduledDate: new Date('2024-12-25T10:00:00Z'),
        publishedDate: undefined,
        userId: 1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should create content with default status when not provided', async () => {
      // Arrange
      const userId = 1;
      const createData: CreateContentData = {
        title: 'Test Post',
        content: 'Test content',
        type: 'social'
      };

      const mockRow = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        type: 'social',
        status: 'draft',
        scheduled_date: null,
        published_date: null,
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1
      } as any);

      // Act
      const result = await ContentService.create(userId, createData);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO content_items'),
        [
          'Test Post',
          'Test content',
          'social',
          'draft', // Default status
          null, // No scheduled date
          1
        ]
      );

      expect(result.status).toBe('draft');
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const userId = 1;
      const createData: CreateContentData = {
        title: 'Test Post',
        content: 'Test content',
        type: 'blog'
      };

      const dbError = new Error('Database connection failed');
      mockDatabase.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(ContentService.create(userId, createData)).rejects.toThrow('Failed to create content');
      expect(mockLogger.error).toHaveBeenCalledWith('Error creating content:', dbError);
    });
  });

  describe('findByUserId', () => {
    it('should return paginated content with default options', async () => {
      // Arrange
      const userId = 1;
      const mockCountResult = { rows: [{ count: '5' }] };
      const mockDataResult = {
        rows: [
          {
            id: 1,
            title: 'Post 1',
            content: 'Content 1',
            type: 'blog',
            status: 'published',
            scheduled_date: null,
            published_date: '2024-01-01T00:00:00Z',
            user_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            title: 'Post 2',
            content: 'Content 2',
            type: 'social',
            status: 'draft',
            scheduled_date: null,
            published_date: null,
            user_id: 1,
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z'
          }
        ]
      };

      mockDatabase.query
        .mockResolvedValueOnce(mockCountResult as any)
        .mockResolvedValueOnce(mockDataResult as any);

      // Act
      const result = await ContentService.findByUserId(userId);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      expect(result.data[0]).toEqual({
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        type: 'blog',
        status: 'published',
        scheduledDate: undefined,
        publishedDate: new Date('2024-01-01T00:00:00Z'),
        userId: 1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should filter by status when provided', async () => {
      // Arrange
      const userId = 1;
      const options = { status: 'published' as const };

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ count: '3' }] } as any)
        .mockResolvedValueOnce({ rows: [] } as any);

      // Act
      await ContentService.findByUserId(userId, options);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND status = $2'),
        [1, 'published']
      );
    });

    it('should filter by type when provided', async () => {
      // Arrange
      const userId = 1;
      const options = { type: 'blog' as const };

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ count: '2' }] } as any)
        .mockResolvedValueOnce({ rows: [] } as any);

      // Act
      await ContentService.findByUserId(userId, options);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND type = $2'),
        [1, 'blog']
      );
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const userId = 1;
      const options = { page: 2, limit: 5 };

      mockDatabase.query
        .mockResolvedValueOnce({ rows: [{ count: '15' }] } as any)
        .mockResolvedValueOnce({ rows: [] } as any);

      // Act
      const result = await ContentService.findByUserId(userId, options);

      // Assert
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: true,
        hasPrev: true
      });

      // Check offset calculation (page 2, limit 5 = offset 5)
      expect(mockDatabase.query).toHaveBeenLastCalledWith(
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        [1, 5, 5]
      );
    });

    it('should handle database errors during findByUserId', async () => {
      // Arrange
      const userId = 1;
      const dbError = new Error('Database query failed');
      mockDatabase.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(ContentService.findByUserId(userId)).rejects.toThrow('Failed to retrieve content');
      expect(mockLogger.error).toHaveBeenCalledWith('Error finding content by user:', dbError);
    });
  });

  describe('findById', () => {
    it('should return content when found', async () => {
      // Arrange
      const id = 1;
      const userId = 1;
      const mockRow = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        type: 'blog',
        status: 'draft',
        scheduled_date: null,
        published_date: null,
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1
      } as any);

      // Act
      const result = await ContentService.findById(id, userId);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'SELECT * FROM content_items WHERE id = $1 AND user_id = $2',
        [1, 1]
      );

      expect(result).toEqual({
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        type: 'blog',
        status: 'draft',
        scheduledDate: undefined,
        publishedDate: undefined,
        userId: 1,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should return null when content not found', async () => {
      // Arrange
      const id = 999;
      const userId = 1;

      mockDatabase.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      } as any);

      // Act
      const result = await ContentService.findById(id, userId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors during findById', async () => {
      // Arrange
      const id = 1;
      const userId = 1;
      const dbError = new Error('Database query failed');
      mockDatabase.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(ContentService.findById(id, userId)).rejects.toThrow('Failed to find content');
      expect(mockLogger.error).toHaveBeenCalledWith('Error finding content by ID:', dbError);
    });
  });

  describe('update', () => {
    it('should update content successfully', async () => {
      // Arrange
      const id = 1;
      const userId = 1;
      const updateData: UpdateContentData = {
        title: 'Updated Title',
        status: 'published'
      };

      const mockRow = {
        id: 1,
        title: 'Updated Title',
        content: 'Original content',
        type: 'blog',
        status: 'published',
        scheduled_date: null,
        published_date: null,
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1
      } as any);

      // Act
      const result = await ContentService.update(id, userId, updateData);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE content_items SET title = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4'),
        ['Updated Title', 'published', 1, 1]
      );

      expect(result?.title).toBe('Updated Title');
      expect(result?.status).toBe('published');
    });

    it('should return null when content not found for update', async () => {
      // Arrange
      const id = 999;
      const userId = 1;
      const updateData: UpdateContentData = {
        title: 'Updated Title'
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      } as any);

      // Act
      const result = await ContentService.update(id, userId, updateData);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when no fields provided for update', async () => {
      // Arrange
      const id = 1;
      const userId = 1;
      const updateData: UpdateContentData = {};

      // Act & Assert
      await expect(ContentService.update(id, userId, updateData)).rejects.toThrow('No fields to update');
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const id = 1;
      const userId = 1;
      const updateData: UpdateContentData = { title: 'Updated' };
      const dbError = new Error('Database update failed');
      mockDatabase.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(ContentService.update(id, userId, updateData)).rejects.toThrow('Failed to update content');
      expect(mockLogger.error).toHaveBeenCalledWith('Error updating content:', dbError);
    });
  });

  describe('delete', () => {
    it('should delete content successfully', async () => {
      // Arrange
      const id = 1;
      const userId = 1;

      mockDatabase.query.mockResolvedValueOnce({
        rowCount: 1
      } as any);

      // Act
      const result = await ContentService.delete(id, userId);

      // Assert
      expect(mockDatabase.query).toHaveBeenCalledWith(
        'DELETE FROM content_items WHERE id = $1 AND user_id = $2',
        [1, 1]
      );

      expect(result).toBe(true);
    });

    it('should return false when content not found for deletion', async () => {
      // Arrange
      const id = 999;
      const userId = 1;

      mockDatabase.query.mockResolvedValueOnce({
        rowCount: 0
      } as any);

      // Act
      const result = await ContentService.delete(id, userId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle database errors during delete', async () => {
      // Arrange
      const id = 1;
      const userId = 1;
      const dbError = new Error('Database delete failed');
      mockDatabase.query.mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(ContentService.delete(id, userId)).rejects.toThrow('Failed to delete content');
      expect(mockLogger.error).toHaveBeenCalledWith('Error deleting content:', dbError);
    });
  });

  describe('mapRowToContentItem', () => {
    it('should map database row to ContentItem correctly', async () => {
      // This tests the private method indirectly through create
      const userId = 1;
      const createData: CreateContentData = {
        title: 'Test',
        content: 'Content',
        type: 'video'
      };

      const mockRow = {
        id: 1,
        title: 'Test',
        content: 'Content',
        type: 'video',
        status: 'draft',
        scheduled_date: '2024-12-25T10:00:00Z',
        published_date: '2024-01-01T12:00:00Z',
        user_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockDatabase.query.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1
      } as any);

      // Act
      const result = await ContentService.create(userId, createData);

      // Assert - Check date mapping
      expect(result.scheduledDate).toEqual(new Date('2024-12-25T10:00:00Z'));
      expect(result.publishedDate).toEqual(new Date('2024-01-01T12:00:00Z'));
      expect(result.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(result.updatedAt).toEqual(new Date('2024-01-01T00:00:00Z'));
    });
  });
});
