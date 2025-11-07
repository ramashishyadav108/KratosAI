import { Request, Response, NextFunction } from 'express';
import { generateTokens } from '../services/tokenService.js';
import { logger } from '../utils/logger.js';
import { env, isProduction } from '../config/env.js';
import { COOKIE } from '../constants/index.js';
import { 
  getGoogleAuthUrl, 
  getGoogleUserProfile, 
  handleGoogleOAuthUser 
} from '../config/auth.js';

/**
 * Initiate Google OAuth flow
 */
export const googleAuth = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('Initiating Google OAuth flow');
    const authUrl = getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Failed to initiate Google OAuth', error);
    next(error);
  }
};

/**
 * Handle Google OAuth callback
 */
export const googleCallback = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code as string;

    if (!code) {
      logger.warn('Google OAuth callback without authorization code');
      res.redirect(`${env.FRONTEND_URL}/login?error=missing_code`);
      return;
    }

    logger.info('Processing Google OAuth callback');

    // Exchange code for user profile
    const profile = await getGoogleUserProfile(code);
    
    // Create or link user account
    const user = await handleGoogleOAuthUser(profile);

    logger.info('Google OAuth successful', { userId: user.id, email: user.email });

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, user.email);

    // Set refresh token cookie
    res.cookie(COOKIE.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE.SAME_SITE,
      maxAge: COOKIE.REFRESH_TOKEN_MAX_AGE,
    });

    // Redirect to frontend with access token
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
    
    logger.info('Google OAuth callback completed', { userId: user.id });
  } catch (error) {
    logger.error('Google OAuth callback failed', error);
    res.redirect(`${env.FRONTEND_URL}/login?error=authentication_failed`);
  }
};
