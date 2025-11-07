import { google } from 'googleapis';
import prisma from './db.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { User } from '@prisma/client';
import { AuthenticationError } from '../middlewares/errorHandler.js';

/**
 * Google OAuth2 Client Configuration
 */
export const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URL
);

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for user profile
 */
export async function getGoogleUserProfile(code: string): Promise<{
  email: string;
  googleId: string;
  name: string;
  picture?: string;
}> {
  try {
    // Get tokens from authorization code
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile information
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.id) {
      logger.error('Google OAuth profile missing required fields', { data });
      throw new AuthenticationError('No email found in Google profile');
    }

    logger.debug('Google profile retrieved', { 
      email: data.email, 
      googleId: data.id 
    });

    return {
      email: data.email,
      googleId: data.id,
      name: data.name || data.email.split('@')[0],
      picture: data.picture || undefined,
    };
  } catch (error) {
    logger.error('Failed to get Google user profile', error);
    throw new AuthenticationError('Failed to authenticate with Google');
  }
}

/**
 * Handle Google OAuth user - create or link account
 */
export async function handleGoogleOAuthUser(profile: {
  email: string;
  googleId: string;
  name: string;
  picture?: string;
}): Promise<User> {
  const { email, googleId, name } = profile;

  logger.debug('Processing Google OAuth user', { email, googleId });

  // Check if user exists with this Google ID
  let user: User | null = await prisma.user.findUnique({
    where: { googleId },
  });

  if (!user) {
    // Check if user exists with this email
    user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Link Google account to existing user
      logger.info('Linking existing user with Google account', { 
        userId: user.id, 
        email 
      });
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, isVerified: true },
      });
    } else {
      // Create new user
      logger.info('Creating new user from Google OAuth', { email, googleId });
      
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name,
          isVerified: true,
        },
      });
    }
  } else {
    logger.info('User logged in via Google OAuth', { 
      userId: user.id, 
      email 
    });
  }

  return user;
}
