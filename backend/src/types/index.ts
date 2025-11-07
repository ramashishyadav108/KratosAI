import { Request } from 'express';

// JWT Payload structure
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Token generation result
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// User response (without sensitive data)
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Service method return types
export interface CreateUserInput {
  email: string;
  password?: string;
  name?: string;
  googleId?: string;
}
