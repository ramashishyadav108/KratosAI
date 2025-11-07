import express, { Router, RequestHandler } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  logoutOtherDevices,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getProfile,
  deleteAccount,
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { validate, signupSchema, loginSchema, emailSchema, resetPasswordSchema } from '../utils/validate.js';

const router: Router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-other-devices', authenticateToken, logoutOtherDevices as RequestHandler);
router.get('/verify-email', verifyEmail);
router.post('/request-password-reset', validate(emailSchema), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/profile', authenticateToken, getProfile as RequestHandler);
router.delete('/delete-account', authenticateToken, deleteAccount as RequestHandler);

export default router;
