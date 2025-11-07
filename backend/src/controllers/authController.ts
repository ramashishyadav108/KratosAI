import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import { 
  createUser, 
  findUserByEmail, 
  findUserById,
  verifyPassword,
  updateUserVerification,
  setVerificationToken,
  setResetToken,
  findUserByResetToken,
  resetUserPassword
} from '../services/userService.js';
import { 
  generateTokens, 
  rotateRefreshToken, 
  revokeRefreshToken,
  revokeAllUserTokens,
  revokeOtherUserTokens
} from '../services/tokenService.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailService.js';
import { AppError, AuthenticationError, NotFoundError } from '../middlewares/errorHandler.js';
import { JWTPayload } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { COOKIE, TOKEN, HTTP_STATUS } from '../constants/index.js';
import { isProduction } from '../config/env.js';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    logger.info('User signup attempt', { email });

    const user = await createUser(email, password, name);

    if (!user.isVerified) {
      const verificationToken = crypto.randomBytes(TOKEN.VERIFICATION_LENGTH).toString('hex');
      await setVerificationToken(user.id, verificationToken);
      await sendVerificationEmail(email, verificationToken);
    }

    const message = user.isVerified 
      ? 'Account synced successfully. You can now login with password.'
      : 'User created successfully. Please verify your email.';

    sendCreated(res, { user }, message);
    logger.info('User signup successful', { userId: user.id, email });
  } catch (error) {
    logger.error('Signup failed', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    logger.info('User login attempt', { email });

    const user = await findUserByEmail(email);

    if (!user || !user.password) {
      logger.warn('Login failed - invalid credentials', { email });
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', { email });
      throw new AuthenticationError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await generateTokens(user.id, user.email);

    res.cookie(COOKIE.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE.SAME_SITE,
      maxAge: COOKIE.REFRESH_TOKEN_MAX_AGE,
    });

    sendSuccess(res, {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    }, 'Login successful');
    
    logger.info('User login successful', { userId: user.id, email });
  } catch (error) {
    logger.error('Login failed', error);
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      logger.warn('Token refresh attempt without refresh token');
      throw new AuthenticationError('Refresh token not provided');
    }

    logger.debug('Refreshing access token');
    const { accessToken, refreshToken } = await rotateRefreshToken(oldRefreshToken);

    res.cookie(COOKIE.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE.SAME_SITE,
      maxAge: COOKIE.REFRESH_TOKEN_MAX_AGE,
    });

    sendSuccess(res, { accessToken }, 'Token refreshed successfully');
    logger.info('Token refreshed successfully');
  } catch (error) {
    logger.error('Token refresh failed', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      logger.debug('Revoking refresh token');
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie(COOKIE.REFRESH_TOKEN_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE.SAME_SITE,
    });

    sendSuccess(res, undefined, 'Logout successful');
    logger.info('User logout successful');
  } catch (error) {
    logger.error('Logout failed', error);
    next(error);
  }
};

export const logoutOtherDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as JWTPayload)?.userId;

    if (!userId) {
      logger.warn('Logout other devices attempt without authentication');
      throw new AuthenticationError('User not authenticated');
    }

    const currentRefreshToken = req.cookies.refreshToken;

    if (!currentRefreshToken) {
      logger.warn('Logout other devices attempt without refresh token', { userId });
      throw new AuthenticationError('Refresh token not found');
    }

    logger.info('Logging out from other devices', { userId });
    await revokeOtherUserTokens(userId, currentRefreshToken);

    sendSuccess(res, undefined, 'Logged out from all other devices successfully');
    logger.info('Logged out from other devices successfully', { userId });
  } catch (error) {
    logger.error('Logout other devices failed', error);
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      logger.warn('Email verification attempt without token');
      throw new AppError('Verification token required', HTTP_STATUS.BAD_REQUEST);
    }

    logger.info('Verifying email with token');
    const user = await updateUserVerification(token);

    sendSuccess(res, { user }, 'Email verified successfully');
    logger.info('Email verified successfully', { userId: user.id });
  } catch (error) {
    logger.error('Email verification failed', error);
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    logger.info('Password reset requested', { email });

    const user = await findUserByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      sendSuccess(res, undefined, 'If the email exists, a reset link has been sent');
      logger.debug('Password reset requested for non-existent email', { email });
      return;
    }

    const resetToken = crypto.randomBytes(TOKEN.RESET_TOKEN_LENGTH).toString('hex');
    const expiryDate = new Date(Date.now() + TOKEN.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await setResetToken(user.id, resetToken, expiryDate);
    await sendPasswordResetEmail(email, resetToken);

    sendSuccess(res, undefined, 'If the email exists, a reset link has been sent');
    logger.info('Password reset email sent', { userId: user.id });
  } catch (error) {
    logger.error('Password reset request failed', error);
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;
    logger.info('Password reset attempt');

    const user = await findUserByResetToken(token);

    if (!user) {
      logger.warn('Invalid or expired reset token provided');
      throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }

    await resetUserPassword(user.id, password);
    await revokeAllUserTokens(user.id);

    sendSuccess(res, undefined, 'Password reset successful');
    logger.info('Password reset successful', { userId: user.id });
  } catch (error) {
    logger.error('Password reset failed', error);
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as JWTPayload)?.userId;

    if (!userId) {
      logger.warn('Get profile attempt without authentication');
      throw new AuthenticationError('User not authenticated');
    }

    logger.debug('Fetching user profile', { userId });
    const user = await findUserById(userId);

    if (!user) {
      logger.warn('User not found', { userId });
      throw new NotFoundError('User not found');
    }

    sendSuccess(res, { user });
    logger.debug('User profile fetched successfully', { userId });
  } catch (error) {
    logger.error('Get profile failed', error);
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as JWTPayload)?.userId;

    if (!userId) {
      logger.warn('Delete account attempt without authentication');
      throw new AuthenticationError('User not authenticated');
    }

    const user = await findUserById(userId);

    if (!user) {
      logger.warn('User not found for deletion', { userId });
      throw new NotFoundError('User not found');
    }

    logger.info('Deleting user account', { userId });
    await revokeAllUserTokens(userId);

    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie(COOKIE.REFRESH_TOKEN_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE.SAME_SITE,
    });

    sendSuccess(res, undefined, 'Account deleted successfully');
    logger.info('User account deleted successfully', { userId });
  } catch (error) {
    logger.error('Account deletion failed', error);
    next(error);
  }
};
