import prisma from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';
import { AppError } from '../middlewares/errorHandler.js';

export const generateTokens = async (userId, email) => {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId, email });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revoked) {
    throw new AppError('Refresh token not found or revoked', 401);
  }

  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });
    throw new AppError('Refresh token expired', 401);
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const newTokens = await generateTokens(decoded.userId, decoded.email);

  return newTokens;
};

export const revokeRefreshToken = async (refreshToken) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    return;
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });
};

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { 
      userId,
      revoked: false,
    },
    data: { revoked: true },
  });
};

export const cleanupExpiredTokens = async () => {
  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true },
      ],
    },
  });
};
