import nodemailer, { Transporter } from 'nodemailer';
import { env, isDevelopment } from '../config/env.js';
import { logger } from '../utils/logger.js';

const transporter: Transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email Address',
    text: `
Email Verification

Thank you for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours. If you didn't create an account, please ignore this email.
    `.trim(),
  };

  if (isDevelopment) {
    logger.info('📧 Verification Email (Development Mode)', {
      to: email,
      link: verificationUrl,
    });
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Verification email sent successfully', { to: email });
    return true;
  } catch (error) {
    logger.error('Failed to send verification email', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Password',
    text: `
Password Reset Request

You requested to reset your password. Click the link below to proceed:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
    `.trim(),
  };

  if (isDevelopment) {
    logger.info('📧 Password Reset Email (Development Mode)', {
      to: email,
      link: resetUrl,
    });
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent successfully', { to: email });
    return true;
  } catch (error) {
    logger.error('Failed to send password reset email', error);
    return false;
  }
};
