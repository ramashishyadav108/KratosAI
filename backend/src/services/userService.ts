import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { AppError, ConflictError } from '../middlewares/errorHandler.js';
import { User } from '@prisma/client';
import { UserResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { PASSWORD } from '../constants/index.js';

export const createUser = async (
  email: string,
  password: string,
  name?: string
): Promise<UserResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.googleId && !existingUser.password) {
      logger.info('Linking password to existing Google OAuth user', { userId: existingUser.id, email });
      const hashedPassword = await bcrypt.hash(password, PASSWORD.SALT_ROUNDS);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          password: hashedPassword,
          name: name || existingUser.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updatedUser;
    }
    logger.warn('Attempt to create user with existing email', { email });
    throw new ConflictError('User already exists with this email');
  }

  logger.info('Creating new user', { email });
  const hashedPassword = await bcrypt.hash(password, PASSWORD.SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  logger.info('User created successfully', { userId: user.id, email });
  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  logger.debug('Finding user by email', { email });
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string): Promise<UserResponse | null> => {
  logger.debug('Finding user by ID', { userId: id });
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const updateUserVerification = async (token: string): Promise<UserResponse> => {
  const user = await prisma.user.findFirst({
    where: { 
      verificationToken: token,
    },
  });

  if (!user) {
    logger.warn('Invalid verification token provided', { token });
    throw new AppError('Invalid or expired verification token', 400);
  }

  logger.info('Verifying user email', { userId: user.id, email: user.email });
  return await prisma.user.update({
    where: { id: user.id },
    data: { 
      isVerified: true, 
      verificationToken: null 
    },
    select: {
      id: true,
      email: true,
      name: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const setVerificationToken = async (userId: string, verificationToken: string): Promise<User> => {
  logger.debug('Setting verification token for user', { userId });
  return await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken,
    },
  });
};

export const setResetToken = async (userId: string, resetToken: string, expiryDate: Date): Promise<User> => {
  logger.info('Setting password reset token', { userId });
  return await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken,
      resetTokenExpiry: expiryDate,
    },
  });
};

export const findUserByResetToken = async (resetToken: string): Promise<User | null> => {
  logger.debug('Finding user by reset token');
  return await prisma.user.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
};

export const resetUserPassword = async (userId: string, newPassword: string): Promise<User> => {
  logger.info('Resetting user password', { userId });
  const hashedPassword = await bcrypt.hash(newPassword, PASSWORD.SALT_ROUNDS);
  
  return await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
};
