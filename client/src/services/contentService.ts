
import { database } from '../config/database';
import { logger } from '../utils/logger';

export interface ContentItem {
  id: number;
  title: string;
  content: string;
  type: 'blog' | 'social' | 'email' | 'video' | 'podcast';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledDate?: Date;
  publishedDate?: Date;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentData {
  title: string;
  content: string;
  type: ContentItem['type'];
  status?: ContentItem['status'];
  scheduledDate?: Date;
}

export interface UpdateContentData extends Partial<CreateContentData> {}

export class ContentService {
  static async create(userId: number, data: CreateContentData): Promise<ContentItem> {
    try {
      const query = `
        INSERT INTO content_items (title, content, type, status, scheduled_date, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        data.title,
        data.content,
        data.type,
        data.status || 'draft',
        data.scheduledDate || null,
        userId
      ];

      const result = await database.query(query, values);
      return this.mapRowToContentItem(result.rows[0]);
    } catch (error) {
      logger.error('Error creating content:', error);
      throw new Error('Failed to create content');
    }
  }

  static async findByUserId(userId: number, options: {
    page?: number;
    limit?: number;
    status?: ContentItem['status'];
    type?: ContentItem['type'];
  } = {}): Promise<{
    data: ContentItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE user_id = $1';
      const queryParams: any[] = [userId];
      let paramIndex = 2;

      if (options.status) {
        whereClause += ` AND status = $${paramIndex}`;
        queryParams.push(options.status);
        paramIndex++;
      }

      if (options.type) {
        whereClause += ` AND type = $${paramIndex}`;
        queryParams.push(options.type);
        paramIndex++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) FROM content_items ${whereClause}`;
      const countResult = await database.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Get paginated data
      const dataQuery = `
        SELECT * FROM content_items 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      const dataResult = await database.query(dataQuery, queryParams);
      const data = dataResult.rows.map(row => this.mapRowToContentItem(row));

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Error finding content by user:', error);
      throw new Error('Failed to retrieve content');
    }
  }

  static async findById(id: number, userId: number): Promise<ContentItem | null> {
    try {
      const query = 'SELECT * FROM content_items WHERE id = $1 AND user_id = $2';
      const result = await database.query(query, [id, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToContentItem(result.rows[0]);
    } catch (error) {
      logger.error('Error finding content by ID:', error);
      throw new Error('Failed to find content');
    }
  }

  static async update(id: number, userId: number, data: UpdateContentData): Promise<ContentItem | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(data.title);
        paramIndex++;
      }

      if (data.content !== undefined) {
        updates.push(`content = $${paramIndex}`);
        values.push(data.content);
        paramIndex++;
      }

      if (data.type !== undefined) {
        updates.push(`type = $${paramIndex}`);
        values.push(data.type);
        paramIndex++;
      }

      if (data.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(data.status);
        paramIndex++;
      }

      if (data.scheduledDate !== undefined) {
        updates.push(`scheduled_date = $${paramIndex}`);
        values.push(data.scheduledDate);
        paramIndex++;
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id, userId);

      const query = `
        UPDATE content_items 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING *
      `;

      const result = await database.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToContentItem(result.rows[0]);
    } catch (error) {
      logger.error('Error updating content:', error);
      if (error.message === 'No fields to update') {
        throw error;
      }
      throw new Error('Failed to update content');
    }
  }

  static async delete(id: number, userId: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM content_items WHERE id = $1 AND user_id = $2';
      const result = await database.query(query, [id, userId]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting content:', error);
      throw new Error('Failed to delete content');
    }
  }

  private static mapRowToContentItem(row: any): ContentItem {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      type: row.type,
      status: row.status,
      scheduledDate: row.scheduled_date ? new Date(row.scheduled_date) : undefined,
      publishedDate: row.published_date ? new Date(row.published_date) : undefined,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
