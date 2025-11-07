import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';
import { env } from '../config/env.js';
import { JWT } from '../constants/index.js';
import { logger } from './logger.js';
import { AuthenticationError } from '../middlewares/errorHandler.js';

export const signAccessToken = (payload: JWTPayload): string => {
  try {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: JWT.ACCESS_TOKEN_EXPIRY,
    });
  } catch (error) {
    logger.error('Failed to sign access token', error);
    throw new AuthenticationError('Failed to generate access token');
  }
};

export const signRefreshToken = (payload: JWTPayload): string => {
  try {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: JWT.REFRESH_TOKEN_EXPIRY,
    });
  } catch (error) {
    logger.error('Failed to sign refresh token', error);
    throw new AuthenticationError('Failed to generate refresh token');
  }
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    logger.debug('Access token verification failed', { error: (error as Error).message });
    throw new AuthenticationError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    logger.debug('Refresh token verification failed', { error: (error as Error).message });
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};
