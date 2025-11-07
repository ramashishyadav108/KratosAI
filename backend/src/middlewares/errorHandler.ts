import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { sendError, sendInternalError } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';
import { isDevelopment } from '../config/env.js';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error classes for common scenarios
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error('Error occurred', err);

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle programming or unknown errors
  if (isDevelopment) {
    sendError(res, err.message || 'Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } else {
    // Don't leak error details in production
    sendInternalError(res, 'Something went wrong');
  }
};

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(): void {
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', reason);
    // Optionally exit process in production
    // process.exit(1);
  });
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', error);
    // Exit process on uncaught exception
    process.exit(1);
  });
}
