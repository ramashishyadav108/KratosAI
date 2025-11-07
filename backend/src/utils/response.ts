import { Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Standard API response structure
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Success response helper
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): void {
  const response: ApiResponse<T> = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
}

/**
 * Error response helper
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  errors?: string[]
): void {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
}

/**
 * Created response helper
 */
export function sendCreated<T>(res: Response, data: T, message: string = 'Resource created successfully'): void {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * Not found response helper
 */
export function sendNotFound(res: Response, message: string = 'Resource not found'): void {
  sendError(res, message, HTTP_STATUS.NOT_FOUND);
}

/**
 * Unauthorized response helper
 */
export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): void {
  sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Forbidden response helper
 */
export function sendForbidden(res: Response, message: string = 'Forbidden'): void {
  sendError(res, message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Validation error response helper
 */
export function sendValidationError(res: Response, errors: string[]): void {
  sendError(res, 'Validation error', HTTP_STATUS.BAD_REQUEST, errors);
}

/**
 * Internal server error response helper
 */
export function sendInternalError(res: Response, message: string = 'Internal server error'): void {
  sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
