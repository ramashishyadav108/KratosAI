/**
 * Application-wide constants
 */

export const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '30d',
  REFRESH_TOKEN_EXPIRY_DAYS: 30,
} as const;

export const COOKIE = {
  REFRESH_TOKEN_NAME: 'refreshToken',
  REFRESH_TOKEN_MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  SAME_SITE: 'strict' as const,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 6,
  SALT_ROUNDS: 12,
} as const;

export const TOKEN = {
  VERIFICATION_LENGTH: 32,
  RESET_TOKEN_LENGTH: 32,
  RESET_TOKEN_EXPIRY_HOURS: 1,
  REFRESH_TOKEN_DAYS: 30,
  CLEANUP_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const GOOGLE_OAUTH = {
  SCOPE: ['profile', 'email'] as const,
} as const;

export const DATABASE = {
  LOG_LEVELS: {
    DEVELOPMENT: ['query', 'error', 'warn'] as const,
    PRODUCTION: ['error'] as const,
  },
} as const;
