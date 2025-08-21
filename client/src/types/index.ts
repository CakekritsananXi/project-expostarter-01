import { Request } from 'express';

// User related types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// JWT related types
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export interface RefreshToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Express request extension
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Database query result types
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Content Management Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  type: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  publishedAt?: string;
  scheduledAt?: string;
  userId: number;
  categoryId?: number;
  campaignId?: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate?: string;
  endDate?: string;
  goals: string[];
  targetAudience?: string;
  budget?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentIdea {
  id: number;
  title: string;
  description?: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  status: 'idea' | 'researching' | 'outlined' | 'in_progress' | 'completed';
  tags: string[];
  targetDate?: string;
  estimatedHours?: number;
  userId: number;
  categoryId?: number;
  campaignId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  allDay: boolean;
  duration?: number;
  userId: number;
  postId?: number;
  campaignId?: number;
  createdAt: string;
  updatedAt: string;
}