import prisma from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';
import { AuthenticationError } from '../middlewares/errorHandler.js';
import { TokenPair } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { TOKEN } from '../constants/index.js';

export const generateTokens = async (userId: string, email: string): Promise<TokenPair> => {
  logger.debug('Generating tokens for user', { userId, email });
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN.REFRESH_TOKEN_DAYS);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  logger.info('Tokens generated successfully', { userId });
  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldRefreshToken: string): Promise<TokenPair> => {
  logger.debug('Rotating refresh token');
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    logger.warn('Refresh token verification failed during rotation');
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revoked) {
    logger.warn('Refresh token not found or already revoked', { userId: decoded.userId });
    throw new AuthenticationError('Refresh token not found or revoked');
  }

  if (new Date() > storedToken.expiresAt) {
    logger.warn('Refresh token expired', { userId: decoded.userId });
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });
    throw new AuthenticationError('Refresh token expired');
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  logger.info('Refresh token rotated successfully', { userId: decoded.userId });
  const newTokens = await generateTokens(decoded.userId, decoded.email);

  return newTokens;
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  logger.debug('Revoking refresh token');
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    logger.debug('Refresh token not found, nothing to revoke');
    return;
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  logger.info('Refresh token revoked', { userId: storedToken.userId });
};

export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  logger.info('Revoking all tokens for user', { userId });
  await prisma.refreshToken.updateMany({
    where: { 
      userId,
      revoked: false,
    },
    data: { revoked: true },
  });
};

export const revokeOtherUserTokens = async (userId: string, currentRefreshToken: string): Promise<void> => {
  logger.info('Revoking other tokens for user', { userId });
  await prisma.refreshToken.updateMany({
    where: { 
      userId,
      revoked: false,
      token: {
        not: currentRefreshToken,
      },
    },
    data: { revoked: true },
  });
};

export const cleanupExpiredTokens = async (): Promise<void> => {
  logger.debug('Cleaning up expired tokens');
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true },
      ],
    },
  });
  logger.info('Expired tokens cleaned up', { count: result.count });
};
