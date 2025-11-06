import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';

export const createUser = async (email, password, name) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.googleId && !existingUser.password) {
      const hashedPassword = await bcrypt.hash(password, 12);
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
        },
      });
      return updatedUser;
    }
    throw new AppError('User already exists with this email', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

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
    },
  });

  return user;
};

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      isVerified: true,
      createdAt: true,
    },
  });
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const updateUserVerification = async (token) => {
  const user = await prisma.user.findFirst({
    where: { 
      verificationToken: token,
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

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
    },
  });
};

export const setVerificationToken = async (userId, verificationToken) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken,
    },
  });
};

export const setResetToken = async (userId, resetToken, expiryDate) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      resetToken,
      resetTokenExpiry: expiryDate,
    },
  });
};

export const findUserByResetToken = async (resetToken) => {
  return await prisma.user.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
};

export const resetUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  return await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
};
