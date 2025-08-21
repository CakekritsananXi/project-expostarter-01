import { Request, Response } from 'express';
import { ApiResponse } from '../types';

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'NOT_FOUND',
  };

  res.status(404).json(response);
};