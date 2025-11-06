import crypto from 'crypto';
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
  revokeAllUserTokens 
} from '../services/tokenService.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailService.js';
import { AppError } from '../middlewares/errorHandler.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const user = await createUser(email, password, name);

    if (!user.isVerified) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await setVerificationToken(user.id, verificationToken);
      await sendVerificationEmail(email, verificationToken);
    }

    const message = user.isVerified 
      ? 'Account synced successfully. You can now login with password.'
      : 'User created successfully. Please verify your email.';

    res.status(201).json({
      success: true,
      message,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = await generateTokens(user.id, user.email);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw new AppError('Refresh token not provided', 401);
    }

    const { accessToken, refreshToken } = await rotateRefreshToken(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await revokeAllUserTokens(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      throw new AppError('Verification token required', 400);
    }

    const user = await updateUserVerification(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    await setResetToken(user.id, resetToken, expiryDate);
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await findUserByResetToken(token);

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    await resetUserPassword(user.id, password);
    await revokeAllUserTokens(user.id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await findUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await findUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await revokeAllUserTokens(userId);

    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
