import express from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  logoutAll,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getProfile,
  deleteAccount,
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { validate, signupSchema, loginSchema, emailSchema, resetPasswordSchema } from '../utils/validate.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/verify-email', verifyEmail);
router.post('/request-password-reset', validate(emailSchema), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/profile', authenticateToken, getProfile);
router.delete('/delete-account', authenticateToken, deleteAccount);

export default router;
